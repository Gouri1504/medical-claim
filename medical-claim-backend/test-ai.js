const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const API_URL = 'http://localhost:3000/api/ai-test';

// Sample medical claim text
const sampleText = `
PATIENT: John Smith
PROVIDER: Dr. Sarah Johnson
DATE OF SERVICE: 01/15/2023
AMOUNT: $150.00

DIAGNOSIS:
- Type 2 Diabetes (E11.9)
- Hypertension (I10)

PROCEDURES:
- Office Visit (99213)
- CT Scan (70450)

This is a medical claim for routine checkup and diagnostic imaging.
`;

// Test direct text extraction
async function testTextExtraction() {
  console.log('Testing text extraction...');
  try {
    const response = await axios.post(`${API_URL}/extract-text`, {
      text: sampleText
    });
    
    console.log('Text extraction result:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Text extraction error:', error.response?.data || error.message);
  }
}

// Test sample data extraction
async function testSampleData() {
  console.log('\nTesting sample data extraction...');
  try {
    const response = await axios.get(`${API_URL}/sample-data`);
    
    console.log('Sample data extraction result:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Sample data extraction error:', error.response?.data || error.message);
  }
}

// Test PDF processing
async function testPdfProcessing() {
  console.log('\nTesting PDF processing...');
  
  // Check if sample PDF exists
  const samplePdfPath = path.join(__dirname, 'sample-claim.pdf');
  if (!fs.existsSync(samplePdfPath)) {
    console.log('Sample PDF not found. Skipping PDF test.');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(samplePdfPath));
    
    const response = await axios.post(`${API_URL}/process-pdf`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('PDF processing result:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('PDF processing error:', error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting AI tests...\n');
  
  await testTextExtraction();
  await testSampleData();
  await testPdfProcessing();
  
  console.log('\nTests completed.');
}

// Execute tests
runTests().catch(error => {
  console.error('Test execution error:', error);
}); 