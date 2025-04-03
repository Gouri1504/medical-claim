const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Generate a local file path for upload
 */
const getUploadPath = async (key) => {
    try {
        // Create user directory if it doesn't exist
        const userDir = path.join(uploadDir, path.dirname(key));
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, key);
        logger.info(`Generated local file path: ${filePath}`);
        return filePath;
    } catch (error) {
        logger.error(`Error generating local file path: ${error.message}`);
        throw error;
    }
};

/**
 * Generate a local file URL for downloading
 */
const getDownloadUrl = async (key) => {
    try {
        // For local development, return a relative path
        const fileUrl = `/uploads/${key}`;
        logger.info(`Generated local file URL: ${fileUrl}`);
        return fileUrl;
    } catch (error) {
        logger.error(`Error generating local file URL: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getUploadPath,
    getDownloadUrl
}; 