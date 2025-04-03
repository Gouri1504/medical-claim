const axios = require('axios');
const logger = require('../config/logger');
const FormData = require('form-data');

class DocumentProcessor {
    constructor() {
        this.pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    }

    validateExtractedData(data) {
        try {
            // Basic validation - check if we have any text
            if (!data || !data.text) {
                return {
                    success: false,
                    error: 'No text was extracted from the document'
                };
            }

            return {
                success: true,
                error: null
            };
        } catch (error) {
            logger.error(`Validation error: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async processDocument(fileBuffer) {
        try {
            logger.info('Processing document buffer');

            // Check if it's a PDF by looking at the magic number
            const isPDF = fileBuffer.slice(0, 4).toString('hex') === '25504446';
            
            if (!isPDF) {
                return {
                    success: false,
                    error: 'Only PDF files are supported',
                    text: null
                };
            }

            logger.info('Sending PDF to Python service');
            const formData = new FormData();
            formData.append('file', fileBuffer, 'document.pdf');

            const response = await axios.post(`${this.pythonServiceUrl}/process-pdf`, formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            if (!response.data.success) {
                return {
                    success: false,
                    error: response.data.error || 'Failed to process PDF',
                    text: null
                };
            }

            // Validate the extracted text
            const validationResult = this.validateExtractedData(response.data);
            if (!validationResult.success) {
                return {
                    success: false,
                    error: validationResult.error,
                    text: null
                };
            }

            return {
                success: true,
                text: response.data.text,
                error: null
            };
        } catch (error) {
            logger.error(`Error processing document: ${error.message}`);
            return {
                success: false,
                error: error.message,
                text: null
            };
        }
    }
}

module.exports = new DocumentProcessor(); 