const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
    constructor() {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            logger.error('Email credentials not found in environment variables');
            throw new Error('Email credentials not configured');
        }

        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        // Verify transporter configuration
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error(`Email transporter verification failed: ${error.message}`);
            } else {
                logger.info('Email transporter is ready to send messages');
            }
        });
    }

    async sendEmail(to, subject, text) {
        try {
            if (!to) {
                logger.warn('No email recipient provided, skipping email send');
                return { success: true, message: 'No recipient, email skipped' };
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text
            };

            await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent successfully to ${to}`);
            return { success: true };
        } catch (error) {
            logger.error(`Email sending failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async sendClaimStatusUpdate(userEmail, claimId, status, notes = '') {
        try {
            if (!userEmail) {
                logger.warn('No user email provided for claim status update');
                return { success: true, message: 'No email provided, notification skipped' };
            }

            const subject = `Claim Status Update - ${claimId}`;
            const text = `Your claim ${claimId} status has been updated to: ${status}\n\n${notes ? `Notes: ${notes}\n\n` : ''}Thank you for using our service.`;

            return await this.sendEmail(userEmail, subject, text);
        } catch (error) {
            logger.error(`Claim status email failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async sendProcessingComplete(email, claimId, text) {
        try {
            if (!email) {
                return {
                    success: false,
                    error: 'No email address provided'
                };
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Claim Processing Complete',
                html: `
                    <h2>Your claim has been processed successfully!</h2>
                    <p>Claim ID: ${claimId}</p>
                    <h3>Extracted Text:</h3>
                    <pre>${text}</pre>
                    <p>Please review the extracted information and make any necessary corrections.</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            logger.info(`Processing complete email sent to ${email}`);
            
            return {
                success: true,
                error: null
            };
        } catch (error) {
            logger.error(`Error sending processing complete email: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new EmailService(); 