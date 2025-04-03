const path = require('path');
const fs = require('fs').promises;
const logger = require('../config/logger');
const Claim = require('../models/Claim');
const documentProcessor = require('./documentProcessor');

class AIService {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 5000; // 5 seconds
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async readFileContent(fileKey) {
        try {
            // Remove the leading slash if present
            const cleanFileKey = fileKey.startsWith('/') ? fileKey.substring(1) : fileKey;
            const filePath = path.join(__dirname, '../../uploads', cleanFileKey);
            logger.info(`Reading file from path: ${filePath}`);
            const fileContent = await fs.readFile(filePath);
            return fileContent;
        } catch (error) {
            logger.error(`Error reading file: ${error.message}`);
            throw error;
        }
    }

    async processDocument(fileKey) {
        try {
            // Remove the leading slash if present
            const cleanFileKey = fileKey.startsWith('/') ? fileKey.substring(1) : fileKey;
            logger.info(`Processing document with key: ${cleanFileKey}`);
            
            // Read file content
            const fileContent = await this.readFileContent(cleanFileKey);
            
            // Process document using documentProcessor
            const result = await documentProcessor.processDocument(fileContent);
            
            if (!result.success) {
                logger.error(`Document processing failed: ${result.error}`);
                return {
                    success: false,
                    error: result.error,
                    data: null
                };
            }

            // Validate the extracted data
            const validationResult = await this.validateExtractedData(result.data);
            if (!validationResult.success) {
                logger.error(`Data validation failed: ${validationResult.error}`);
                return {
                    success: false,
                    error: validationResult.error,
                    data: result.data
                };
            }

            return {
                success: true,
                data: result.text
            };
        } catch (error) {
            logger.error(`Document Processing Error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    async processClaimWithAI(claimId) {
        let attempt = 1;

        while (attempt <= this.maxRetries) {
            try {
                const claim = await Claim.findById(claimId);
                if (!claim) {
                    throw new Error('Claim not found');
                }

                // Update processing status
                claim.aiProcessingStatus.status = 'processing';
                claim.aiProcessingStatus.attempts = attempt;
                claim.aiProcessingStatus.lastAttempt = new Date();
                await claim.save();

                // Read file content
                const fileContent = await this.readFileContent(claim.fileKey);

                // Process document
                const result = await this.processDocument(claim.fileKey);
                
                if (!result.success) {
                    throw new Error(result.error);
                }

                const extractedData = result.data;

                // Update claim with extracted data
                claim.dateOfService = new Date(extractedData.dateOfService);
                claim.amount = extractedData.amount;
                claim.patientName = extractedData.patientName;
                claim.providerName = extractedData.providerName;
                claim.claimType = extractedData.claimType;
                claim.diagnosisCodes = extractedData.diagnosisCodes;
                claim.procedureCodes = extractedData.procedureCodes;
                claim.extractedData = extractedData;
                claim.status = 'pending';
                claim.aiProcessingStatus.status = 'completed';
                await claim.save();

                logger.info(`Successfully processed claim ${claimId} with AI`);
                return;

            } catch (error) {
                logger.error(`AI Processing Error (Attempt ${attempt}/${this.maxRetries}): ${error.message}`);
                
                if (attempt === this.maxRetries) {
                    const claim = await Claim.findById(claimId);
                    if (claim) {
                        claim.aiProcessingStatus.status = 'failed';
                        claim.aiProcessingStatus.error = error.message;
                        await claim.save();
                    }
                    logger.error(`AI Processing Error for Claim ${claimId}: ${error.message}`);
                }
                
                attempt++;
                // Wait before retrying (exponential backoff)
                await this.sleep(this.retryDelay * attempt);
            }
        }
    }

    async validateExtractedData(data) {
        try {
            // Use document processor's validation
            documentProcessor.validateExtractedData(data);
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            logger.error(`AI Validation Error: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async reprocessClaim(claimId, previousData = null) {
        try {
            const claim = await Claim.findById(claimId);
            if (!claim) {
                throw new Error('Claim not found');
            }

            const fileContent = await this.readFileContent(claim.fileKey);
            const result = await this.processDocument(claim.fileKey);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const extractedData = result.data;

            // Update claim with new extracted data
            claim.dateOfService = new Date(extractedData.dateOfService);
            claim.amount = extractedData.amount;
            claim.patientName = extractedData.patientName;
            claim.providerName = extractedData.providerName;
            claim.claimType = extractedData.claimType;
            claim.diagnosisCodes = extractedData.diagnosisCodes;
            claim.procedureCodes = extractedData.procedureCodes;
            claim.extractedData = extractedData;
            claim.status = 'pending';
            claim.aiProcessingStatus.status = 'completed';
            await claim.save();

            return {
                success: true,
                data: extractedData,
                status: 'completed'
            };
        } catch (error) {
            logger.error(`AI Reprocessing Error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                status: 'failed'
            };
        }
    }

    async getProcessingStatus(claimId) {
        try {
            const claim = await Claim.findById(claimId);
            if (!claim) {
                throw new Error('Claim not found');
            }

            return {
                success: true,
                status: claim.aiProcessingStatus.status,
                attempts: claim.aiProcessingStatus.attempts,
                error: claim.aiProcessingStatus.error
            };
        } catch (error) {
            logger.error(`AI Status Check Error: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new AIService(); 