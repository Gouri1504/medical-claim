# Medical Claims Processing System

A full-stack application for processing medical claims, featuring document upload, AI-powered information extraction, and automated processing workflow.

## System Architecture

The system consists of three main components:

1. **Frontend** (React + TypeScript)
2. **Backend** (Node.js + Express)
3. **PDF Processing Service** (Python + FastAPI)

## Features

### Frontend
- Modern, responsive UI with Material-UI components
- Drag-and-drop file upload
- Real-time processing status updates
- Interactive dashboard for claim management
- Email notifications for processing status
- Secure authentication and authorization

### Backend
- RESTful API endpoints
- MongoDB database integration
- File storage and management
- Email notification service
- Integration with PDF processing service
- JWT-based authentication

### PDF Processing Service
- PDF text extraction using OCR
- AI-powered information extraction
- Structured data extraction for:
  - Patient information
  - Provider details
  - Dates of service
  - Amounts
  - Medical codes (ICD-10, CPT)
  - Claim types
- Health check endpoints

## Prerequisites

- Node.js (v18 or higher)
- Python 3.11
- MongoDB
- npm or yarn
- Homebrew (for macOS)

## Environment Setup

### 1. Frontend Setup

```bash
# Clone the repository
git clone <repository-url>
cd medical-claim-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update environment variables
VITE_API_URL=http://localhost:3000
VITE_PYTHON_SERVICE_URL=http://localhost:8000
```

### 2. Backend Setup

```bash
cd medical-claim-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update environment variables
PORT=3000
MONGODB_URI=mongodb://localhost:27017/medical_claims
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
PYTHON_SERVICE_URL=http://localhost:8000
```

### 3. PDF Processing Service Setup

```bash
cd pdf-processor-service

# Create and activate virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install system dependencies (macOS)
brew install poppler tesseract

# Create .env file
cp .env.example .env

# Update environment variables
PORT=8000
```

## Required System Dependencies

### macOS
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required packages
brew install poppler tesseract python@3.11
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y poppler-utils tesseract-ocr python3.11 python3.11-venv
```

## Starting the Services

### 1. Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod
```

### 2. Start the Backend
```bash
cd medical-claim-backend
npm run dev
```

### 3. Start the PDF Processing Service
```bash
cd pdf-processor-service
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start the Frontend
```bash
cd medical-claim-frontend
npm run dev
```

## API Endpoints

### Backend API
- `POST /api/claims` - Create a new claim
- `GET /api/claims` - Get all claims
- `GET /api/claims/:id` - Get a specific claim
- `PUT /api/claims/:id` - Update a claim
- `DELETE /api/claims/:id` - Delete a claim
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### PDF Processing Service
- `POST /process-pdf` - Process a PDF document
- `GET /health` - Health check endpoint

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_PYTHON_SERVICE_URL=http://localhost:8000
```

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/medical_claims
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
PYTHON_SERVICE_URL=http://localhost:8000
```

### PDF Processing Service (.env)
```
PORT=8000
```

## Gmail Setup for Email Notifications

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security > 2-Step Verification > App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. Update the backend .env file with your email and app password

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check the connection string in .env
   - Verify MongoDB service status

2. **PDF Processing Service Issues**
   - Check if poppler and tesseract are installed
   - Verify Python virtual environment is activated
   - Check service logs for errors

3. **Email Sending Issues**
   - Verify Gmail credentials
   - Check if 2-Step Verification is enabled
   - Ensure correct app password is used

### Logs

- Backend logs: `medical-claim-backend/logs/`
- PDF Processing Service logs: Console output
- Frontend errors: Browser console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
