const AWS = require('aws-sdk');
const logger = require('./logger');

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

/**
 * Upload file to S3
 */
const uploadToS3 = async (file, key) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'private'
        };

        const result = await s3.upload(params).promise();
        logger.info(`File uploaded to S3: ${result.Location}`);
        return result.Location;
    } catch (error) {
        logger.error(`Error uploading to S3: ${error.message}`);
        throw error;
    }
};

/**
 * Generate a Pre-Signed URL for downloading files from S3
 */
const getDownloadSignedUrl = async (key) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Expires: 3600 // 1-hour expiration
        };

        const downloadUrl = await s3.getSignedUrlPromise('getObject', params);
        logger.info(`Generated download signed URL for S3: ${downloadUrl}`);
        return downloadUrl;
    } catch (error) {
        logger.error(`Error generating download signed URL: ${error.message}`);
        throw error;
    }
};

module.exports = {
    uploadToS3,
    getDownloadSignedUrl
};
