const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileKey: {
        type: String,
        required: true
    },
    dateOfService: {
        type: Date
    },
    amount: {
        type: Number
    },
    patientName: {
        type: String
    },
    providerName: {
        type: String
    },
    claimType: {
        type: String,
        enum: ['medical', 'dental', 'vision', 'pharmacy']
    },
    diagnosisCodes: [{
        type: String
    }],
    procedureCodes: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['processing', 'pending', 'approved', 'rejected', 'paid'],
        default: 'processing'
    },
    extractedData: {
        type: mongoose.Schema.Types.Mixed
    },
    aiProcessingStatus: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        attempts: {
            type: Number,
            default: 0
        },
        lastAttempt: Date,
        error: String
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Claim', claimSchema); 