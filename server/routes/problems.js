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

// Public read routes
router.get('/', getProblems);
router.get('/:id', getProblemById);

// Protected modification routes
router.post('/', authenticate, createProblem);
router.patch('/:id', authenticate, updateProblem);
router.delete('/:id', authenticate, deleteProblem);

module.exports = router;

