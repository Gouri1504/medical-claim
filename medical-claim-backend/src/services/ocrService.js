const Tesseract = require('tesseract.js');
const logger = require('../config/logger');

/**
 * Extracts text from an image using Tesseract OCR
 * @param {Buffer} imageBuffer - The image buffer to process
 * @returns {Promise<string>} - The extracted text
 */
async function extractTextFromImage(imageBuffer) {
    try {
        const result = await Tesseract.recognize(
            imageBuffer,
            'eng',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        logger.info(`OCR Progress: ${m.progress * 100}%`);
                    }
                }
            }
        );
        return result.data.text;
    } catch (error) {
        logger.error(`OCR Error: ${error.message}`);
        throw error;
    }
}

module.exports = {
    extractTextFromImage
}; 