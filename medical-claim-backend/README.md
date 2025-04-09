# Medical Claims Processing System - Backend

A Node.js backend for processing medical claims using Google's Generative AI (Gemini).

## Features

- PDF document processing
- AI-powered information extraction
- Structured data validation
- RESTful API endpoints
- MongoDB integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

3. Start the server:
```bash
npm run dev
```

## AI Testing

The system includes several endpoints for testing the AI functionality:

### 1. Text Extraction

Extract information from plain text:
```
POST /api/ai-test/extract-text
Content-Type: application/json

{
  "text": "Your medical claim text here..."
}
```

### 2. Sample Data Extraction

Test with a predefined sample:
```
GET /api/ai-test/sample-data
```

### 3. PDF Processing

Process a PDF document:
```
POST /api/ai-test/process-pdf
Content-Type: multipart/form-data

file: [PDF file]
```

## Running Tests

To run the AI tests:
```bash
npm run test:ai
```

This will test all three endpoints with sample data.

## Sample PDF

For PDF testing, place a sample PDF file named `sample-claim.pdf` in the root directory.

## API Response Format

Successful responses will have the following format:
```json
{
  "success": true,
  "data": {
    "patientName": "John Smith",
    "providerName": "Dr. Sarah Johnson",
    "dateOfService": "2023-01-15T00:00:00.000Z",
    "amount": 150,
    "claimType": "medical",
    "diagnosisCodes": ["E11.9", "I10"],
    "procedureCodes": ["99213", "70450"]
  },
  "rawResponse": "..."
}
```

Error responses will have the following format:
```json
{
  "success": false,
  "error": "Error message",
  "details": "..."
}
``` 