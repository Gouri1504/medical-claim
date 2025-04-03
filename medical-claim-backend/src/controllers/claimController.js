const Claim = require('../models/Claim');
const User = require('../models/User');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs');
const { log } = require('console');
const documentProcessor = require('../services/documentProcessor');

// @desc Upload claim file
// @route POST /api/claims/upload
// @access Private
exports.uploadClaimFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create user-specific directory
        const userDir = path.join(__dirname, '../../uploads/claims', req.user.id);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(req.file.originalname);
        const filename = `${timestamp}-${randomString}${ext}`;

        // Save file to disk
        const filePath = path.join(userDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);

        // Create file key using user ID and filename
        const fileKey = `claims/${req.user.id}/${filename}`;

        res.status(200).json({
            success: true,
            data: {
                fileKey,
                fileUrl: `/uploads/${fileKey}`
            }
        });
    } catch (error) {
        logger.error(`Upload Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Get file URL
// @route GET /api/claims/:key/download
// @access Private
exports.getClaimFileUrl = async (req, res) => {
    try {
        const claim = await Claim.findOne({
            _id: req.params.key,
            user: req.user.id
        });

        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        res.json({
            success: true,
            data: {
                fileUrl: `/uploads/${claim.fileKey}`
            }
        });
    } catch (error) {
        logger.error(`Get File URL Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Create claim after file upload
// @route POST /api/claims
// @access Private
exports.createClaim = async (req, res) => {
    try {
        const { fileKey } = req.body;

        // Create claim record with minimal required data
        const claim = await Claim.create({
            user: req.user.id,
            fileKey,
            status: 'processing',
            aiProcessingStatus: {
                status: 'pending',
                attempts: 0
            }
        });

        // Start AI processing immediately
        processClaimWithAI(claim._id);

        res.status(201).json({
            success: true,
            data: claim
        });
    } catch (error) {
        logger.error(`Create Claim Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Process claim with AI
// @route   POST /api/claims/:id/process
// @access  Private
exports.processClaim = async (req, res) => {
    try {
        const { claimId } = req.params;
        const claim = await Claim.findById(claimId);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        // Process the document
        const result = await documentProcessor.processDocument(claim.fileKey);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        // Update claim status
        claim.status = 'processed';
        claim.processedText = result.text;
        await claim.save();

        // Get user email
        const user = await User.findById(claim.user);
        if (!user || !user.email) {
            logger.warn(`No email found for user ${claim.user}`);
            return res.status(200).json({
                success: true,
                message: 'Claim processed successfully but no email found for notification'
            });
        }

        // Send email notification
        const emailResult = await emailService.sendProcessingComplete(
            user.email,
            claim._id,
            result.text
        );

        if (!emailResult.success) {
            logger.error(`Failed to send email: ${emailResult.error}`);
        }

        res.status(200).json({
            success: true,
            message: 'Claim processed successfully',
            data: result.text
        });
    } catch (error) {
        logger.error(`Error processing claim: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// @desc    Get AI processing status
// @route   GET /api/claims/:id/status
// @access  Private
exports.getProcessingStatus = async (req, res) => {
    try {
        const claim = await Claim.findOne({ _id: req.params.id, user: req.user.id });

        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        const aiStatus = await aiService.getProcessingStatus(claim._id);

        res.json({
            success: true,
            data: {
                claimStatus: claim.status,
                aiProcessingStatus: claim.aiProcessingStatus,
                aiServiceStatus: aiStatus
            }
        });
    } catch (error) {
        logger.error(`Get Processing Status Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all claims for logged-in user
// @route   GET /api/claims
// @access  Private
exports.getClaims = async (req, res) => {
    try {
        const claims = await Claim.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, count: claims.length, data: claims });
    } catch (error) {
        logger.error(`Get Claims Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single claim with download URL
// @route   GET /api/claims/:id
// @access  Private
exports.getClaim = async (req, res) => {
    try {
        const claim = await Claim.findOne({ _id: req.params.id, user: req.user.id });

        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        const fileUrl = `/uploads/${claim.fileKey}`;

        res.json({ success: true, data: { ...claim.toObject(), fileUrl } });
    } catch (error) {
        logger.error(`Get Claim Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update claim details
// @route   PUT /api/claims/:id
// @access  Private
exports.updateClaim = async (req, res) => {
    try {
        const claim = await Claim.findOne({ _id: req.params.id, user: req.user.id });

        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        Object.assign(claim, req.body);
        await claim.save();

        res.json({ success: true, data: claim });
    } catch (error) {
        logger.error(`Update Claim Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update claim status (Admin only)
// @route   PUT /api/claims/:id/status
// @access  Private/Admin
exports.updateClaimStatus = async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        claim.status = req.body.status;
        claim.processedBy = req.user.id;
        claim.notes = req.body.notes || claim.notes;

        await claim.save();

        await emailService.sendClaimStatusUpdate(claim.user.email, claim._id, claim.status, claim.notes);

        res.json({ success: true, data: claim });
    } catch (error) {
        logger.error(`Update Claim Status Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reprocess claim with AI
// @route   POST /api/claims/:id/reprocess
// @access  Private
exports.reprocessClaim = async (req, res) => {
    try {
        const claim = await Claim.findOne({ _id: req.params.id, user: req.user.id });

        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        if (claim.aiProcessingStatus.attempts >= 3) {
            return res.status(400).json({ message: 'Maximum retry attempts reached' });
        }

        claim.status = 'processing';
        claim.aiProcessingStatus.attempts += 1;
        claim.aiProcessingStatus.lastAttempt = new Date();
        await claim.save();

        processClaimWithAI(claim._id);
        res.json({ success: true, data: claim });
    } catch (error) {
        logger.error(`Reprocess Claim Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper function to process claim with AI
async function processClaimWithAI(claimId) {
    try {
        const claim = await Claim.findById(claimId);
        if (!claim) return;

        claim.aiProcessingStatus.status = 'processing';
        claim.aiProcessingStatus.lastAttempt = new Date();
        await claim.save();

        const result = await aiService.processDocument(claim.fileKey);
        console.log(result);
        if (result.success) {
            claim.extractedData = result.data;
            claim.aiProcessingStatus.status = 'completed';
            claim.status = 'pending';
            await claim.save();

            logger.info(`Claim ${claimId} processed successfully`);

            // Send processing complete email if user has email
            if (claim.user) {
                const user = await User.findById(claim.user);
                if (user && user.email) {
                    const emailResult = await emailService.sendProcessingComplete(
                        user.email,
                        claim._id,
                        result.data
                    );
                    if (!emailResult.success) {
                        logger.warn(`Failed to send processing complete email: ${emailResult.error}`);
                    }
                } else {
                    logger.warn(`No email found for user ${claim.user}`);
                }
            }
        } else {
            claim.aiProcessingStatus.status = 'failed';
            claim.aiProcessingStatus.error = result.error;
            await claim.save();
        }
    } catch (error) {
        logger.error(`AI Processing Error for Claim ${claimId}: ${error.message}`);
        const claim = await Claim.findById(claimId);
        if (claim) {
            claim.aiProcessingStatus.status = 'failed';
            claim.aiProcessingStatus.error = error.message;
            await claim.save();
        }
    }
}