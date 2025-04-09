const generateFakeClaim = require('../utils/generateFakeClaim');

async function main() {
  try {
    const pdfPath = await generateFakeClaim();
    console.log('Fake claim PDF generated successfully at:', pdfPath);
  } catch (error) {
    console.error('Error generating fake claim:', error);
  }
}

main(); 