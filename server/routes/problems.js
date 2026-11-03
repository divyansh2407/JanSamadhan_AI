/**
 * JanSamadhan – Problem Routes
 * Mounted at /api/problems
 */

const express = require('express');
const router = express.Router();

const {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
} = require('../controllers/problemController');

const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createProblemSchema,
  updateProblemSchema,
} = require('../validators/problemValidators');

// Public read routes
router.get('/', getProblems);
router.get('/:id', getProblemById);

// Protected modification routes
router.post('/', authenticate, validate(createProblemSchema), createProblem);
router.patch('/:id', authenticate, validate(updateProblemSchema), updateProblem);
router.delete('/:id', authenticate, deleteProblem);


module.exports = router;

