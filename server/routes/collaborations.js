/**
 * JanSamadhan – Collaboration Routes (Stage 11)
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  listCollaborations,
  getCollaboration,
  createCollaboration,
  joinCollaboration,
  updateCollaborationStatus,
} = require('../controllers/collaborationController');

router.get('/', authenticate, listCollaborations);
router.get('/:id', authenticate, getCollaboration);
router.post('/', authenticate, authorize('GOVERNMENT', 'SUPER_ADMIN'), createCollaboration);
router.post('/:id/join', authenticate, joinCollaboration);
router.patch('/:id/status', authenticate, authorize('GOVERNMENT', 'SUPER_ADMIN'), updateCollaborationStatus);

module.exports = router;
