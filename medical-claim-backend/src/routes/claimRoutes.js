const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multerConfig');
const {
    uploadClaimFile,
    getClaimFileUrl,
    createClaim,
    getClaims,
    getClaim,
    updateClaim,
    updateClaimStatus,
    reprocessClaim,
    getProcessingStatus
} = require('../controllers/claimController');

// Protect all routes
router.use(protect);

// File upload routes
router.post('/upload', upload.single('file'), uploadClaimFile);

// Claim routes
router.post('/', createClaim);
router.get('/', getClaims);
router.get('/:id', getClaim);
router.put('/:id', updateClaim);

// File download route
router.get('/:key/download', getClaimFileUrl);

// AI processing routes
router.get('/:id/status', getProcessingStatus);
router.post('/:id/reprocess', reprocessClaim);

// Admin only routes
router.put('/:id/status', authorize('admin'), updateClaimStatus);

module.exports = router;