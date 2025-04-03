from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
from pdf_processor import process_pdf
from fastapi.responses import JSONResponse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the service is running.
    Returns status of required dependencies.
    """
    try:
        # Check if Tesseract is available
        import pytesseract
        pytesseract.get_tesseract_version()
        
        # Check if pdf2image is available
        from pdf2image import convert_from_path
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "dependencies": {
                    "tesseract": "available",
                    "pdf2image": "available"
                }
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

@app.post("/process-pdf")
async def process_pdf_endpoint(file: UploadFile = File(...)):
    try:
        logger.info(f"Received file: {file.filename}")
        
        # Read the file content
        file_content = await file.read()
        
        # Process the PDF
        text = process_pdf(file_content)
        
        return {
            "success": True,
            "text": text,
            "error": None
        }
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        return {
            "success": False,
            "text": None,
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 