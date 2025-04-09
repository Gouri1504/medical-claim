const logger = require('../config/logger');

class EmailService {
    constructor() {
        logger.info('Email service is disabled - using no-op implementation');
    }

    async sendEmail(to, subject, text) {
        logger.debug(`[EMAIL DISABLED] Would send email to: ${to}, subject: ${subject}`);
        return { success: true, message: 'Email service disabled' };
    }

    async sendClaimStatusUpdate(userEmail, claimId, status, notes = '') {
        logger.debug(`[EMAIL DISABLED] Would send status update to: ${userEmail}, claim: ${claimId}, status: ${status}`);
        return { success: true, message: 'Email service disabled' };
    }

    async sendProcessingComplete(userEmail, claimId, extractedData) {
        logger.debug(`[EMAIL DISABLED] Would send processing complete to: ${userEmail}, claim: ${claimId}`);
        return { success: true, message: 'Email service disabled' };
    }
}

module.exports = new EmailService(); 