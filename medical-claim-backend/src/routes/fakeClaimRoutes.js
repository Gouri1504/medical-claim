const express = require('express');
const router = express.Router();
const { generateFakeClaimController } = require('../controllers/fakeClaimController');
const { authenticateToken } = require('../middleware/auth');

// Route to generate a fake claim PDF
router.post('/generate', authenticateToken, generateFakeClaimController);

module.exports = router; 