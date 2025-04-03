from pdf2image import convert_from_bytes
import pytesseract
import logging
from typing import Dict, Any
from ai_extractor import MedicalDocumentExtractor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the AI extractor
extractor = MedicalDocumentExtractor()

def process_pdf(pdf_content: bytes) -> Dict[str, Any]:
    """
    Process a PDF file and extract text and information using OCR and AI
    """
    try:
        logger.info("Starting PDF processing")
        
        # Convert PDF to images
        images = convert_from_bytes(pdf_content)
        logger.info(f"Converted PDF to {len(images)} images")
        
        extracted_text = []
        for i, image in enumerate(images):
            logger.info(f"Processing page {i + 1}/{len(images)}")
            text = pytesseract.image_to_string(image)
            extracted_text.append(text)
        
        # Combine all text
        full_text = "\n\n".join(extracted_text)
        logger.info("Text extraction completed")
        
        # Extract structured information using AI
        extracted_data = extractor.extract_information(full_text)
        logger.info("Information extraction completed")
        
        return {
            "success": True,
            "text": full_text,
            "data": extracted_data,
            "error": None
        }
        
    except Exception as e:
        logger.error(f"Error in PDF processing: {str(e)}")
        return {
            "success": False,
            "text": None,
            "data": None,
            "error": str(e)
        } 