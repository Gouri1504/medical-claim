const logger = require('../config/logger');
const geminiService = require('./geminiService');
const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();

class DocumentProcessor {
    constructor() {
        // No need for external service URLs anymore
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
            console.log(isPDF);
            
            if (!isPDF) {
                return {
                    success: false,
                    error: 'Only PDF files are supported',
                    text: null
                };
            }

            // Extract text from PDF using pdf.js-extract
            try {
                // Convert the buffer extraction to a Promise-based approach
                const extractedText = await new Promise((resolve, reject) => {
                    const options = {
                        // You can customize options here if needed
                        // For example: normalizeWhitespace: true
                    };
                    
                    pdfExtract.extractBuffer(fileBuffer, options, (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        // Extract text from the pages
                        let text = '';
                        if (data && data.pages) {
                            for (const page of data.pages) {
                                if (page.content) {
                                    // Sort content by y position (top to bottom) and then x position (left to right)
                                    const sortedContent = page.content.sort((a, b) => {
                                        // First sort by y position (with some tolerance for same line)
                                        const yDiff = Math.abs(a.y - b.y);
                                        if (yDiff > 5) { // 5 is a tolerance value for same line
                                            return a.y - b.y;
                                        }
                                        // If on same line, sort by x position
                                        return a.x - b.x;
                                    });
                                    
                                    // Build text from sorted content
                                    let lastY = null;
                                    for (const item of sortedContent) {
                                        if (lastY !== null && Math.abs(item.y - lastY) > 5) {
                                            text += '\n';
                                        }
                                        text += item.str + ' ';
                                        lastY = item.y;
                                    }
                                    text += '\n\n'; // Add page separator
                                }
                            }
                        }
                        
                        resolve(text);
                    });
                });
                
                console.log('Extracted text:', extractedText);

                if (!extractedText || extractedText.trim() === '') {
                    return {
                        success: false,
                        error: 'No text could be extracted from the PDF',
                        text: null
                    };
                }

                // Use Gemini service to get structured data
                const extractionResult = await geminiService.extractInformation(extractedText);

                if (!extractionResult.success) {
                    return {
                        success: false,
                        error: extractionResult.error,
                        text: extractedText
                    };
                }

                return {
                    success: true,
                    text: extractedText,
                    data: extractionResult.data,
                    error: null
                };
            } catch (error) {
                // Handle PDF extraction errors
                logger.error(`PDF extraction error: ${error.message}`);
                return {
                    success: false,
                    error: `PDF extraction error: ${error.message}. The PDF might be corrupted or in an unsupported format.`,
                    text: null
                };
            }
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
