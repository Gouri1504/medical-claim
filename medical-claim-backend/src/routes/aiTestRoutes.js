const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentProcessor = require('../services/documentProcessor');
const logger = require('../config/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/test');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Test route for direct text extraction
router.post('/extract-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text is required' 
      });
    }

    const geminiService = require('../services/geminiService');
    const result = await geminiService.extractInformation(text);

    res.json(result);
  } catch (error) {
    logger.error(`Text extraction error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test route for PDF processing
router.post('/process-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    // Read the uploaded file
    const fileBuffer = fs.readFileSync(req.file.path);
    
    // Process the document
    const result = await documentProcessor.processDocument(fileBuffer);
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    res.json(result);
  } catch (error) {
    logger.error(`PDF processing error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test route for sample data extraction
router.get('/sample-data', async (req, res) => {
  try {
    const sampleText = `
      PATIENT: John Smith
      PROVIDER: Dr. Sarah Johnson
      DATE OF SERVICE: 01/15/2023
      AMOUNT: $150.00
      
      DIAGNOSIS:
      - Type 2 Diabetes (E11.9)
      - Hypertension (I10)
      
      PROCEDURES:
      - Office Visit (99213)
      - CT Scan (70450)
      
      This is a medical claim for routine checkup and diagnostic imaging.
    `;

    const geminiService = require('../services/geminiService');
    const result = await geminiService.extractInformation(sampleText);

    res.json(result);
  } catch (error) {
    logger.error(`Sample data extraction error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router; 