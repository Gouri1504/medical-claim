const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../config/logger');

class GeminiService {
    constructor() {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error('Google AI API key is not configured');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }

    async extractInformation(text) {
        try {
            logger.info('Sending text to Gemini for extraction');

            const prompt = `You are a medical claims processing AI. Extract the following information from this medical claim document and return it in JSON format:
            {
                "patientName": "Full name of the patient",
                "providerName": "Name of the healthcare provider",
                "dateOfService": "YYYY-MM-DD format",
                "amount": "numeric value only",
                "claimType": "one of: medical, dental, vision, pharmacy",
                "diagnosisCodes": ["array of ICD-10 codes"],
                "procedureCodes": ["array of CPT codes"]
            }

            Only return the JSON object, no additional text or explanation.
            
            Document text:
            ${text}`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const extractedText = response.text();

            // Try to parse the JSON response
            let extractedData;
            try {
                extractedData = JSON.parse(extractedText);
            } catch (parseError) {
                logger.error(`JSON parsing error: ${parseError.message}`);
                logger.debug(`Raw response: ${extractedText}`);
                
                // Try to extract JSON from the response if it's wrapped in other text
                const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        extractedData = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        throw new Error('Failed to parse AI response as JSON');
                    }
                } else {
                    throw new Error('Failed to parse AI response as JSON');
                }
            }

            // Validate and structure the data
            const structuredData = this.validateAndStructureData(extractedData);

            return {
                success: true,
                data: structuredData,
                rawResponse: extractedText
            };
        } catch (error) {
            logger.error(`Gemini Extraction Error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                data: null
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

module.exports = new GeminiService(); 