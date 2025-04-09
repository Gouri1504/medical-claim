const generateFakeClaim = require('../utils/generateFakeClaim');
const { logger } = require('../utils/logger');

const generateFakeClaimController = async (req, res) => {
  try {
    const pdfPath = await generateFakeClaim();
    logger.info(`Fake claim PDF generated at: ${pdfPath}`);
    
    // Return the path to the generated PDF
    res.status(200).json({
      success: true,
      message: 'Fake claim PDF generated successfully',
      data: {
        pdfPath: pdfPath.replace(/\\/g, '/') // Convert Windows path to URL-friendly format
      }
    });
  } catch (error) {
    logger.error('Error generating fake claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate fake claim',
      error: error.message
    });
  }
};

module.exports = {
  generateFakeClaimController
}; 