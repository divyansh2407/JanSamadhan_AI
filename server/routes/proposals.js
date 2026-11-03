/**
 * JanSamadhan – Proposal & Implementation Routes (Stage 12)
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  listProposals,
  getProposal,
  createProposal,
  updateProposalStatus,
  listTasks,
  createTask,
  updateTask,
} = require('../controllers/proposalController');

// Tasks endpoints (must come before :id to prevent collision)
router.get('/tasks/list', authenticate, listTasks);
router.post('/tasks', authenticate, authorize('GOVERNMENT', 'SUPER_ADMIN'), createTask);
router.patch('/tasks/:id', authenticate, updateTask);

// Proposal endpoints
router.get('/', authenticate, listProposals);
router.get('/:id', authenticate, getProposal);
router.post('/', authenticate, createProposal);
router.patch('/:id/status', authenticate, authorize('GOVERNMENT', 'SUPER_ADMIN'), updateProposalStatus);

module.exports = router;
