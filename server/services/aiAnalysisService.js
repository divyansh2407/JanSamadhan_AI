/**
 * JanSamadhan – AI Analysis Service (Grok Engine Integration)
 * Orchestrates civic report intake, duplicate detection, prompt sanitization,
 * Zod response validation, category/department database reconciliation,
 * and human-in-the-loop review persistence.
 */

const { prisma } = require('../config/db');
const { callGrok } = require('./grokService');
const { grokOutputSchema } = require('../validators/aiAnalysisValidators');

/**
 * Perform AI analysis on a submitted problem report
 * @param {string} problemId - UUID of the problem
 * @param {Object} options - { forceReanalyze: boolean, isTestMode: boolean, reviewerId: string }
 */
async function analyzeProblem(problemId, options = {}) {
  const { forceReanalyze = false, isTestMode = false } = options;

  // 1. Fetch problem details from PostgreSQL
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      category: { select: { id: true, name: true } },
      assignedDepartment: { select: { id: true, name: true } },
    },
  });

  if (!problem) {
    throw new Error(`Problem with ID ${problemId} not found`);
  }

  // 2. Prevent duplicate processing if an existing COMPLETED analysis exists and force is false
  const existingAnalysis = await prisma.aIAnalysis.findFirst({
    where: { problemId },
    orderBy: { createdAt: 'desc' },
  });

  if (existingAnalysis && existingAnalysis.processingStatus === 'COMPLETED' && !forceReanalyze) {
    return existingAnalysis;
  }

  // Check if currently already in PROCESSING state to prevent concurrent duplicated calls
  if (existingAnalysis && existingAnalysis.processingStatus === 'PROCESSING' && !forceReanalyze) {
    const ageMs = Date.now() - new Date(existingAnalysis.createdAt).getTime();
    if (ageMs < 30000) {
      // Still running within 30s timeout window
      return existingAnalysis;
    }
  }

  // 3. Fetch active categories and departments for ground truth mapping
  const [categories, departments] = await Promise.all([
    prisma.problemCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
  ]);

  // 4. Duplicate Detection: Query recent problems in same city/ward submitted in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const candidateDuplicates = await prisma.problem.findMany({
    where: {
      id: { not: problemId },
      city: { equals: problem.city, mode: 'insensitive' },
      createdAt: { gte: thirtyDaysAgo },
    },
    take: 5,
    select: {
      id: true,
      trackingNumber: true,
      title: true,
      address: true,
      city: true,
      category: { select: { name: true } },
    },
  });

  // 5. Create or update an analysis record in PENDING / PROCESSING state
  const analysisRecord = await prisma.aIAnalysis.create({
    data: {
      problemId,
      summary: 'Analysis in progress by Grok AI...',
      detectedCategory: problem.category?.name || 'Pending Classification',
      severity: problem.severity || 'MEDIUM',
      suggestedSolutions: '[]',
      recommendedDepartment: problem.assignedDepartment?.name || 'Pending Recommendation',
      confidence: 0.0,
      modelName: process.env.XAI_MODEL || 'grok-2-latest',
      processingStatus: 'PROCESSING',
      requiresHumanReview: true,
      reviewStatus: 'PENDING',
    },
  });

  try {
    // 6. Invoke Grok AI
    const grokResponse = await callGrok(problem, {
      categories,
      departments,
      potentialDuplicates: candidateDuplicates,
      isTestMode,
    });

    const rawData = grokResponse.data;

    // 7. Validate AI structured output using Zod
    const validationResult = grokOutputSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error('Grok output failed Zod validation:', validationResult.error.format());
      throw new Error(`Malformed AI response: ${validationResult.error.issues?.[0]?.message || 'Schema mismatch'}`);
    }

    const validated = validationResult.data;

    // 8. Reconcile suggested category against database records
    let matchedCategoryName = validated.suggestedCategory;
    const catMatch = categories.find(
      (c) => c.name.toLowerCase() === validated.suggestedCategory.toLowerCase()
    );
    if (catMatch) {
      matchedCategoryName = catMatch.name;
    } else if (problem.category?.name) {
      matchedCategoryName = problem.category.name;
    }

    // 9. Reconcile suggested department against database records
    let matchedDeptName = validated.suggestedDepartment;
    const deptMatch = departments.find(
      (d) => d.name.toLowerCase() === validated.suggestedDepartment.toLowerCase()
    );
    if (deptMatch) {
      matchedDeptName = deptMatch.name;
    } else if (departments.length > 0) {
      matchedDeptName = departments[0].name;
    }

    // 10. Update analysis record with validated AI intelligence
    const updatedAnalysis = await prisma.aIAnalysis.update({
      where: { id: analysisRecord.id },
      data: {
        summary: validated.summary,
        detectedCategory: matchedCategoryName,
        categoryConfidence: validated.categoryConfidence,
        severity: validated.severity,
        severityConfidence: validated.severityConfidence,
        severityReason: validated.severityReason,
        suggestedSolutions: JSON.stringify(validated.solutionSuggestions),
        recommendedDepartment: matchedDeptName,
        departmentConfidence: validated.departmentConfidence,
        urgency: validated.urgency,
        possibleDuplicates: JSON.stringify(validated.possibleDuplicates || []),
        confidence: Number(
          ((validated.categoryConfidence + validated.severityConfidence + validated.departmentConfidence) / 3).toFixed(2)
        ),
        modelName: grokResponse.model || 'grok-2-latest',
        processingStatus: 'COMPLETED',
        requiresHumanReview: true,
        reviewStatus: 'PENDING',
        promptTokens: grokResponse.usage?.promptTokens || 0,
        completionTokens: grokResponse.usage?.completionTokens || 0,
        totalTokens: grokResponse.usage?.totalTokens || 0,
        durationMs: grokResponse.durationMs || 0,
      },
    });

    return updatedAnalysis;
  } catch (err) {
    console.error(`[AI Analysis Service] Error analyzing problem ${problemId}:`, err.message);

    // Save failure status without failing the citizen's report
    const failedAnalysis = await prisma.aIAnalysis.update({
      where: { id: analysisRecord.id },
      data: {
        summary: 'Automatic AI analysis could not be completed at this time. Queued for manual officer review.',
        processingStatus: 'FAILED',
        errorMessage: err.message.slice(0, 500),
        requiresHumanReview: true,
      },
    });

    return failedAnalysis;
  }
}

/**
 * Asynchronous, non-blocking wrapper to trigger AI analysis
 */
function analyzeProblemAsync(problemId, options = {}) {
  setImmediate(async () => {
    try {
      await analyzeProblem(problemId, options);
    } catch (err) {
      console.warn(`[AI Analysis Async] Background analysis failed for problem ${problemId}:`, err.message);
    }
  });
}

/**
 * Fetch latest AI analysis for a problem report
 */
async function getLatestAnalysis(problemId) {
  const analysis = await prisma.aIAnalysis.findFirst({
    where: { problemId },
    orderBy: { createdAt: 'desc' },
  });

  if (!analysis) return null;

  return formatAnalysisResponse(analysis);
}

/**
 * Fetch full AI analysis historical audits
 */
async function getAnalysisHistory(problemId) {
  const history = await prisma.aIAnalysis.findMany({
    where: { problemId },
    orderBy: { createdAt: 'desc' },
  });

  return history.map(formatAnalysisResponse);
}

/**
 * Review an AI analysis record (Officer human-in-the-loop action)
 */
async function reviewAnalysis(analysisId, reviewData, reviewingOfficer) {
  const { action, notes, editedFields = {} } = reviewData;

  const existing = await prisma.aIAnalysis.findUnique({
    where: { id: analysisId },
  });

  if (!existing) {
    throw new Error('AI analysis record not found');
  }

  const updatePayload = {
    reviewStatus: action,
    reviewedBy: reviewingOfficer.id,
    reviewedAt: new Date(),
    reviewNotes: notes || null,
    requiresHumanReview: false,
  };

  // If officer edited any field, record the modifications
  if (action === 'EDIT' && editedFields) {
    if (editedFields.suggestedCategory) updatePayload.detectedCategory = editedFields.suggestedCategory;
    if (editedFields.severity) updatePayload.severity = editedFields.severity;
    if (editedFields.suggestedDepartment) updatePayload.recommendedDepartment = editedFields.suggestedDepartment;
    if (editedFields.urgency) updatePayload.urgency = editedFields.urgency;
  }

  const updated = await prisma.aIAnalysis.update({
    where: { id: analysisId },
    data: updatePayload,
  });

  // Log audit history entry for transparency
  await prisma.activityLog.create({
    data: {
      userId: reviewingOfficer.id,
      action: `AI_ANALYSIS_${action}`,
      entityType: 'AI_ANALYSIS',
      entityId: analysisId,
      metadata: JSON.stringify({
        problemId: existing.problemId,
        action,
        notes: notes || '',
        editedFields: action === 'EDIT' ? editedFields : null,
      }),
    },
  });

  return formatAnalysisResponse(updated);
}

/**
 * Format database record to cleanly parsed JSON response
 */
function formatAnalysisResponse(record) {
  if (!record) return null;

  let solutionSuggestions = [];
  let possibleDuplicates = [];

  try {
    solutionSuggestions = JSON.parse(record.suggestedSolutions || '[]');
  } catch (e) {
    solutionSuggestions = [];
  }

  try {
    possibleDuplicates = JSON.parse(record.possibleDuplicates || '[]');
  } catch (e) {
    possibleDuplicates = [];
  }

  return {
    id: record.id,
    problemId: record.problemId,
    summary: record.summary,
    suggestedCategory: record.detectedCategory,
    categoryConfidence: record.categoryConfidence ?? record.confidence,
    severity: record.severity,
    severityConfidence: record.severityConfidence ?? record.confidence,
    severityReason: record.severityReason || 'Standard municipal severity evaluation',
    suggestedDepartment: record.recommendedDepartment,
    departmentConfidence: record.departmentConfidence ?? record.confidence,
    urgency: record.urgency,
    solutionSuggestions,
    possibleDuplicates,
    confidence: record.confidence,
    modelName: record.modelName,
    processingStatus: record.processingStatus,
    errorMessage: record.errorMessage,
    requiresHumanReview: record.requiresHumanReview,
    reviewStatus: record.reviewStatus,
    reviewedBy: record.reviewedBy,
    reviewedAt: record.reviewedAt,
    reviewNotes: record.reviewNotes,
    tokens: {
      prompt: record.promptTokens || 0,
      completion: record.completionTokens || 0,
      total: record.totalTokens || 0,
    },
    durationMs: record.durationMs || 0,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

module.exports = {
  analyzeProblem,
  analyzeProblemAsync,
  getLatestAnalysis,
  getAnalysisHistory,
  reviewAnalysis,
  formatAnalysisResponse,
};
