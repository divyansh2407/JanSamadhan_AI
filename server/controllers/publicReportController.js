/**
 * JanSamadhan – Anonymous Public Report Controller
 * Handles cryptographically secured, zero-PII anonymous report intake and tracking.
 */

const crypto = require('crypto');
const { prisma } = require('../config/db');


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
      city,
      state = 'Maharashtra',
      pincode = '411001',
      wardId,
      latitude,
      longitude,
      imageUrl,
    } = req.body;

    // Verify category exists
    const category = await prisma.problemCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Problem category not found',
      });
    }

    // 1. Generate non-sequential public tracking ID
    const currentYear = new Date().getFullYear();
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const publicTrackingId = `TRK-${currentYear}-${randomSuffix}`;

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

    // 5. Execute transactional insert into PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      // Create Problem record with isAnonymous: true and reportedBy: null
      const problem = await tx.problem.create({
        data: {
          title,
          description,
          categoryId,
          isAnonymous: true,
          reportedBy: null, // Zero User identity link
          address,
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

      // If photographic proof provided, attach to ProblemImage table
      if (imageUrl) {
        await tx.problemImage.create({
          data: {
            problemId: problem.id,
            imageUrl,
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
    const { trackingId } = req.params;

    // Extract secret tracking token from header, query, or body
    const providedToken =
      req.headers['x-tracking-token'] || req.query.token || req.body?.token;

    if (!providedToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message:
          'Tracking credential required. Please provide your secret tracking token via the X-Tracking-Token header or token parameter.',
      });
    }

    // Lookup anonymous report record by public tracking ID
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

    if (!anonymousRecord || !anonymousRecord.problem) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'No anonymous report found with the provided tracking ID',
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
        message: 'Invalid secret tracking token. Access denied.',
      });
    }

    const { problem } = anonymousRecord;

    // Return sanitized public tracking details
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Anonymous report status retrieved successfully',
      data: {
        trackingId: anonymousRecord.publicTrackingId,
        title: problem.title,
        description: problem.description,
        category: problem.category.name,
        categoryIcon: problem.category.icon,
        status: problem.status,
        severity: problem.severity,
        priority: problem.priority,
        isVerified: problem.isVerified,
        address: problem.address,
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
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAnonymousReport,
  trackAnonymousReport,
};

