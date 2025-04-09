const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateFakeClaim = async () => {
  // Generate random data
  const claimData = {
    patientName: 'John Doe',
    patientId: 'P' + Math.floor(Math.random() * 1000000),
    dateOfService: new Date().toISOString().split('T')[0],
    providerName: 'City General Hospital',
    providerId: 'PROV' + Math.floor(Math.random() * 10000),
    diagnosis: 'Acute Upper Respiratory Infection',
    procedure: 'Office Visit',
    amount: (Math.random() * 1000).toFixed(2),
    insuranceId: 'INS' + Math.floor(Math.random() * 100000),
    claimNumber: 'CLM' + Math.floor(Math.random() * 1000000)
  };

  // Create a new PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Set the output path
  const pdfPath = path.join(uploadsDir, `fake_claim_${claimData.claimNumber}.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));

  // Add content to the PDF
  doc.fontSize(20).text('Medical Claim Form', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Claim Number: ${claimData.claimNumber}`, { align: 'center' });
  doc.moveDown(2);

  // Patient Information
  doc.fontSize(16).text('Patient Information');
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Name: ${claimData.patientName}`);
  doc.text(`Patient ID: ${claimData.patientId}`);
  doc.text(`Insurance ID: ${claimData.insuranceId}`);
  doc.moveDown(2);

  // Service Details
  doc.fontSize(16).text('Service Details');
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Date of Service: ${claimData.dateOfService}`);
  doc.text(`Provider Name: ${claimData.providerName}`);
  doc.text(`Provider ID: ${claimData.providerId}`);
  doc.text(`Diagnosis: ${claimData.diagnosis}`);
  doc.text(`Procedure: ${claimData.procedure}`);
  doc.text(`Amount: $${claimData.amount}`);
  doc.moveDown(2);

  // Footer
  doc.fontSize(10)
    .text('This is a computer-generated document for testing purposes only.', { align: 'center' })
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

  // Finalize the PDF
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(pdfPath));
    doc.on('error', reject);
  });
};

module.exports = generateFakeClaim; 