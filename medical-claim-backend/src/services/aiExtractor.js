const axios = require('axios');
const logger = require('../config/logger');

class AIExtractor {
    constructor() {
        this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000/process-document';
    }

    async extractInformation(text) {
        try {
            logger.info('Sending text to AI service for extraction');

            const prompt = `Extract the following information from this medical claim document in JSON format:
            - Patient Name
            - Provider Name
            - Date of Service (in YYYY-MM-DD format)
            - Amount (numeric value only)
            - Claim Type (medical, dental, vision, or pharmacy)
            - Diagnosis Codes (array of ICD-10 codes)
            - Procedure Codes (array of CPT codes)
            
            Document text:
            ${text}`;

            const response = await axios.post(this.aiServiceUrl, {
                text: text,
                prompt: prompt
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to extract information');
            }

            // Validate and structure the extracted data
            const extractedData = this.validateAndStructureData(response.data.data);

            return {
                success: true,
                data: extractedData
            };
        } catch (error) {
            logger.error(`AI Extraction Error: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    validateAndStructureData(data) {
        // Ensure all required fields are present and properly formatted
        const structuredData = {
            patientName: data.patientName || '',
            providerName: data.providerName || '',
            dateOfService: data.dateOfService ? new Date(data.dateOfService) : null,
            amount: parseFloat(data.amount) || 0,
            claimType: this.validateClaimType(data.claimType),
            diagnosisCodes: Array.isArray(data.diagnosisCodes) ? data.diagnosisCodes : [],
            procedureCodes: Array.isArray(data.procedureCodes) ? data.procedureCodes : []
        };

        return structuredData;
    }

    validateClaimType(type) {
        const validTypes = ['medical', 'dental', 'vision', 'pharmacy'];
        return validTypes.includes(type) ? type : 'medical';
    }
}

module.exports = new AIExtractor(); 