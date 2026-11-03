/**
 * JanSamadhan – Anonymous Public Report Controller
 * Handles cryptographically secured, zero-PII anonymous report intake and tracking.
 */

const crypto = require('crypto');
const { prisma } = require('../config/db');
const offlineStore = require('../config/offlineStore');
const { analyzeProblemAsync } = require('../services/aiAnalysisService');

function isDbOffline(err) {
  return (
    !err ||
    err.code === 'P1001' ||
    err.name?.includes('Prisma') ||
    (err.message && err.message.includes("Can't reach database server"))
  );
}


/**
 * Submit an anonymous civic problem report
 * POST /api/public/reports
 */
const submitAnonymousReport = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      address,
      landmark,
      city,
      state = 'Maharashtra',
      pincode = '411001',
      wardId,
      latitude,
      longitude,
      imageUrl,
      imageUrls = [],
    } = req.body;


    // Verify category exists with offline-first resilience
    let category = null;
    let resolvedCategoryId = categoryId;
    try {
      category = await prisma.problemCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        category = await prisma.problemCategory.findFirst({
          where: { isActive: true },
        });
        if (category) resolvedCategoryId = category.id;
      }
    } catch (catErr) {
      if (isDbOffline(catErr)) {
        category = offlineStore.categories.find((c) => c.id === categoryId) || offlineStore.categories[0];
        resolvedCategoryId = category?.id || 'cat-electricity';
      } else {
        throw catErr;
      }
    }

    if (!category) {
      category = offlineStore.categories.find((c) => c.id === categoryId) || offlineStore.categories[0];
      resolvedCategoryId = category?.id || 'cat-electricity';
    }

    // 1. Generate non-sequential public tracking ID matching JS-2026-XXXXXX format
    const currentYear = new Date().getFullYear();
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const publicTrackingId = `JS-${currentYear}-${randomSuffix}`;

    // 2. Generate 256-bit high-entropy secret tracking token
    const secretTrackingToken = crypto.randomBytes(32).toString('hex'); // 64 hex characters

    // 3. Cryptographically hash the secret token with a random salt
    const salt = crypto.randomBytes(16).toString('hex');
    const trackingTokenHash = crypto
      .createHash('sha256')
      .update(secretTrackingToken + salt)
      .digest('hex');

    // 4. Create ephemeral subnet hash for rate limiting / abuse detection (daily rotated, non-reversible)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const daySalt = new Date().toISOString().slice(0, 10);
    const ipSubnetHash = crypto
      .createHash('sha256')
      .update(`${clientIp}-${daySalt}`)
      .digest('hex');

    // 5. Execute transactional insert into PostgreSQL (with offline fallback)
    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        // Create Problem record with isAnonymous: true and reportedBy: null
        const problem = await tx.problem.create({
          data: {
            trackingNumber: publicTrackingId,
            title,
            description,
            categoryId: resolvedCategoryId,
            isAnonymous: true,
            reportedBy: null, // Zero User identity link
            address,
            landmark: landmark ? landmark.trim() : null,
            city,
            state,
            pincode,
            wardId: wardId || null,
            latitude: latitude || null,
            longitude: longitude || null,
            severity: 'MEDIUM',
            priority: 'MEDIUM',
            status: 'SUBMITTED',
            isVerified: false,
          },
        });

        // Handle photos (single or array)
        const allImages = [];
        if (imageUrl) allImages.push(imageUrl);
        if (Array.isArray(imageUrls)) {
          imageUrls.forEach((u) => {
            if (u && !allImages.includes(u)) allImages.push(u);
          });
        }

        for (const img of allImages) {
          await tx.problemImage.create({
            data: {
              problemId: problem.id,
              imageUrl: img,
              stage: 'INTAKE',
              caption: 'Anonymous citizen evidence submission',
            },
          });
        }

        // Create AnonymousReport record with secret token hash
        await tx.anonymousReport.create({
          data: {
            problemId: problem.id,
            publicTrackingId,
            trackingTokenHash,
            trackingTokenSalt: salt,
            ipSubnetHash,
          },
        });

        // Record initial immutable lifecycle audit history
        await tx.problemStatusHistory.create({
          data: {
            problemId: problem.id,
            fromStatus: 'SUBMITTED',
            toStatus: 'SUBMITTED',
            changedBy: 'ANONYMOUS',
            remarks: 'Anonymous citizen submission received and queued for verification.',
          },
        });

        return problem;
      });
    } catch (txErr) {
      if (isDbOffline(txErr)) {
        const offlineProblem = offlineStore.createProblem({
          trackingNumber: publicTrackingId,
          title,
          description,
          categoryId: resolvedCategoryId,
          isAnonymous: true,
          address,
          landmark: landmark ? landmark.trim() : null,
          city,
          state,
          pincode,
          imageUrl,
        });
        return res.status(201).json({
          success: true,
          statusCode: 201,
          offline: true,
          message:
            'Anonymous problem report submitted successfully. Save your secret tracking token now.',
          data: {
            trackingId: publicTrackingId,
            secretTrackingToken,
            status: 'SUBMITTED',
            category: category?.name || 'Civic Infrastructure',
            city: offlineProblem.city,
            submittedAt: offlineProblem.createdAt,
            notice:
              'Save your Secret Tracking Token now. This key is never stored in plaintext and cannot be recovered if lost.',
          },
        });
      }
      throw txErr;
    }

    // Trigger Grok AI Analysis asynchronously without blocking HTTP response
    try {
      analyzeProblemAsync(result.id);
    } catch (aiErr) {
      console.warn('AI trigger failed (non-blocking):', aiErr.message);
    }

    // 6. Return response containing secretTrackingToken ONCE
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message:
        'Anonymous problem report submitted successfully. Save your secret tracking token now.',
      data: {
        trackingId: publicTrackingId,
        secretTrackingToken, // Plaintext returned exactly once
        status: 'SUBMITTED',
        category: category.name,
        city: result.city,
        submittedAt: result.createdAt,
        notice:
          'Save your Secret Tracking Token now. This key is never stored in plaintext and cannot be recovered if lost.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track an anonymous problem report using public tracking ID + secret tracking token
 * GET /api/public/reports/:trackingId
 */
const trackAnonymousReport = async (req, res, next) => {
  try {
    const trackingId = req.params.trackingId || req.body?.trackingId;

    // Extract secret tracking token from header, query, or body
    const providedToken =
      req.headers['x-tracking-token'] || req.query.token || req.body?.token || req.body?.secretToken;

    // Direct GET /api/public/reports/:trackingId requires secret tracking token
    if (!providedToken && req.method === 'GET') {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message:
          'Tracking credential required. Please provide your secret tracking token via the X-Tracking-Token header or token parameter.',
      });
    }


    // 1. Check if this is an anonymous report
    const anonymousRecord = await prisma.anonymousReport.findUnique({
      where: { publicTrackingId: trackingId },
      include: {
        problem: {
          include: {
            category: { select: { id: true, name: true, icon: true } },
            assignedDepartment: {
              select: { id: true, name: true, departmentCode: true, contactPhone: true },
            },
            images: { select: { id: true, imageUrl: true, stage: true, createdAt: true } },
            statusHistory: {
              select: { fromStatus: true, toStatus: true, remarks: true, createdAt: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (anonymousRecord && anonymousRecord.problem) {
      // Secret token verification is MANDATORY for anonymous reports
      if (!providedToken) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          isAnonymous: true,
          message:
            'Tracking credential required. This is an anonymous report: please provide your secret tracking token.',
        });
      }

      // Verify secret token using constant-time comparison to prevent timing attacks
      const computedHash = crypto
        .createHash('sha256')
        .update(providedToken + anonymousRecord.trackingTokenSalt)
        .digest('hex');

      const expectedBuffer = Buffer.from(anonymousRecord.trackingTokenHash, 'hex');
      const actualBuffer = Buffer.from(computedHash, 'hex');

      if (
        expectedBuffer.length !== actualBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
      ) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          isAnonymous: true,
          message: 'Invalid secret tracking token. Access denied.',
        });
      }

      const { problem } = anonymousRecord;

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Anonymous report status retrieved successfully',
        data: {
          trackingId: anonymousRecord.publicTrackingId,
          isAnonymous: true,
          title: problem.title,
          description: problem.description,
          category: problem.category.name,
          categoryIcon: problem.category.icon,
          status: problem.status,
          severity: problem.severity,
          priority: problem.priority,
          isVerified: problem.isVerified,
          address: problem.address,
          landmark: problem.landmark,
          city: problem.city,
          state: problem.state,
          pincode: problem.pincode,
          latitude: problem.latitude,
          longitude: problem.longitude,
          assignedDepartment: problem.assignedDepartment
            ? {
                name: problem.assignedDepartment.name,
                code: problem.assignedDepartment.departmentCode,
              }
            : null,
          images: problem.images,
          progressUpdates: problem.statusHistory.map((h) => ({
            status: h.toStatus,
            remarks: h.remarks,
            timestamp: h.createdAt,
          })),
          createdAt: problem.createdAt,
          updatedAt: problem.updatedAt,
        },
      });
    }

    // 2. If not anonymous, check if it matches a registered Problem tracking number or ID
    const registeredProblem = await prisma.problem.findFirst({
      where: {
        OR: [
          { trackingNumber: trackingId },
          ...(trackingId.match(/^[0-9a-fA-F-]{36}$/) ? [{ id: trackingId }] : []),
        ],
      },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        assignedDepartment: {
          select: { id: true, name: true, departmentCode: true, contactPhone: true },
        },
        images: { select: { id: true, imageUrl: true, stage: true, createdAt: true } },
        statusHistory: {
          select: { fromStatus: true, toStatus: true, remarks: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!registeredProblem) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'No report found with the provided tracking ID',
      });
    }

    // Return sanitized public tracking details for registered problem (ZERO reporter PII exposed)
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Report status retrieved successfully',
      data: {
        trackingId: registeredProblem.trackingNumber || registeredProblem.id,
        isAnonymous: false,
        title: registeredProblem.title,
        description: registeredProblem.description,
        category: registeredProblem.category.name,
        categoryIcon: registeredProblem.category.icon,
        status: registeredProblem.status,
        severity: registeredProblem.severity,
        priority: registeredProblem.priority,
        isVerified: registeredProblem.isVerified,
        address: registeredProblem.address,
        landmark: registeredProblem.landmark,
        city: registeredProblem.city,
        state: registeredProblem.state,
        pincode: registeredProblem.pincode,
        latitude: registeredProblem.latitude,
        longitude: registeredProblem.longitude,
        assignedDepartment: registeredProblem.assignedDepartment
          ? {
              name: registeredProblem.assignedDepartment.name,
              code: registeredProblem.assignedDepartment.departmentCode,
            }
          : null,
        images: registeredProblem.images,
        progressUpdates: registeredProblem.statusHistory.map((h) => ({
          status: h.toStatus,
          remarks: h.remarks,
          timestamp: h.createdAt,
        })),
        createdAt: registeredProblem.createdAt,
        updatedAt: registeredProblem.updatedAt,
      },
    });
  } catch (error) {
    if (isDbOffline(error)) {
      const trackingId = req.params.trackingId || req.body?.trackingId;
      const prob = offlineStore.findProblem(trackingId);
      if (prob) {
        return res.status(200).json({
          success: true,
          statusCode: 200,
          offline: true,
          message: 'Report status retrieved successfully',
          data: {
            trackingId: prob.trackingNumber,
            isAnonymous: prob.isAnonymous,
            title: prob.title,
            description: prob.description,
            category: prob.category?.name || 'Civic Infrastructure',
            categoryIcon: prob.category?.icon || 'HelpCircle',
            status: prob.status || 'SUBMITTED',
            severity: prob.severity || 'MEDIUM',
            priority: prob.priority || 'MEDIUM',
            isVerified: prob.isVerified || false,
            address: prob.address,
            landmark: prob.landmark,
            city: prob.city,
            state: prob.state,
            pincode: prob.pincode,
            latitude: prob.latitude,
            longitude: prob.longitude,
            assignedDepartment: prob.assignedDepartment,
            images: prob.images || [],
            progressUpdates: (prob.statusHistory || []).map((h) => ({
              status: h.toStatus,
              remarks: h.remarks,
              timestamp: h.createdAt,
            })),
            createdAt: prob.createdAt,
            updatedAt: prob.updatedAt,
          },
        });
      }
    }
    next(error);
  }
};

module.exports = {
  submitAnonymousReport,
  trackAnonymousReport,
};

