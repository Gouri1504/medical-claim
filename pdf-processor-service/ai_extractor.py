import re
import spacy
from typing import Dict, Any, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MedicalDocumentExtractor:
    def __init__(self):
        try:
            # Load the English language model
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("✅ NLP model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Error loading NLP model: {str(e)}")
            raise

    def extract_date(self, text: str) -> Optional[str]:
        """Extract date of service from text using both regex and NLP"""
        try:
            # Common date patterns in medical documents
            date_patterns = [
                r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}',  # MM/DD/YYYY or DD/MM/YYYY
                r'\d{4}[-/]\d{1,2}[-/]\d{1,2}',    # YYYY/MM/DD
                r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}'  # Month DD, YYYY
            ]
            
            # Try regex patterns first
            for pattern in date_patterns:
                matches = re.findall(pattern, text)
                if matches:
                    return matches[0]
            
            # Try NLP if regex fails
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ == "DATE":
                    return ent.text
                    
            return None
        except Exception as e:
            logger.error(f"Error extracting date: {str(e)}")
            return None

    def extract_amount(self, text: str) -> Optional[float]:
        """Extract amount from text using regex"""
        try:
            # Look for currency patterns
            amount_patterns = [
                r'\$?\s*\d+(?:,\d{3})*(?:\.\d{2})?',  # $1,234.56 or 1234.56
                r'\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|dollars)',  # 1,234.56 USD
            ]
            
            for pattern in amount_patterns:
                matches = re.findall(pattern, text)
                if matches:
                    # Clean the amount string and convert to float
                    amount_str = matches[0].replace('$', '').replace(',', '').strip()
                    try:
                        return float(amount_str)
                    except ValueError:
                        continue
            return None
        except Exception as e:
            logger.error(f"Error extracting amount: {str(e)}")
            return None

    def extract_names(self, text: str) -> Dict[str, Optional[str]]:
        """Extract patient and provider names using NLP"""
        try:
            doc = self.nlp(text)
            names = {
                'patient_name': None,
                'provider_name': None
            }
            
            # First try to find names using NLP entities and context
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    # Get the surrounding context
                    start = max(0, ent.start - 5)
                    end = min(len(doc), ent.end + 5)
                    context = doc[start:end].text.lower()
                    
                    # Check if this is likely a provider name
                    if any(word in context for word in ['dr.', 'doctor', 'physician', 'provider']):
                        names['provider_name'] = ent.text
                    # Check if this is likely a patient name
                    elif any(word in context for word in ['patient', 'name', 'insured', 'member']):
                        names['patient_name'] = ent.text
            
            # If NLP didn't find names, try the keyword approach
            if not names['patient_name'] or not names['provider_name']:
                for sent in doc.sents:
                    sent_text = sent.text.lower()
                    for token in sent:
                        if token.text.lower() in ['patient', 'name', 'insured', 'member']:
                            # Look for proper nouns after the keyword
                            for child in token.children:
                                if child.pos_ == 'PROPN':
                                    names['patient_name'] = child.text
                                    break
                        elif token.text.lower() in ['provider', 'doctor', 'physician', 'dr.']:
                            # Look for proper nouns after the keyword
                            for child in token.children:
                                if child.pos_ == 'PROPN':
                                    names['provider_name'] = child.text
                                    break
            
            return names
        except Exception as e:
            logger.error(f"Error extracting names: {str(e)}")
            return {'patient_name': None, 'provider_name': None}

    def extract_codes(self, text: str) -> Dict[str, List[str]]:
        """Extract medical codes (ICD-10, CPT) using regex"""
        try:
            codes = {
                'diagnosis_codes': [],
                'procedure_codes': []
            }
            
            # ICD-10 codes (e.g., E11.9, I10)
            icd_pattern = r'\b[A-Z]\d{2}(?:\.\d{1,2})?\b'
            codes['diagnosis_codes'] = re.findall(icd_pattern, text)
            
            # CPT codes (5 digits)
            cpt_pattern = r'\b\d{5}\b'
            codes['procedure_codes'] = re.findall(cpt_pattern, text)
            
            return codes
        except Exception as e:
            logger.error(f"Error extracting codes: {str(e)}")
            return {'diagnosis_codes': [], 'procedure_codes': []}

    def determine_claim_type(self, text: str, codes: Dict[str, List[str]]) -> str:
        """Determine the type of claim based on content and codes"""
        try:
            text_lower = text.lower()
            
            # Keywords for different claim types
            claim_type_keywords = {
                'medical': ['medical', 'health', 'hospital', 'clinic', 'doctor', 'physician'],
                'dental': ['dental', 'dentist', 'tooth', 'teeth', 'oral'],
                'vision': ['vision', 'eye', 'optical', 'glasses', 'contact lens'],
                'pharmacy': ['pharmacy', 'prescription', 'drug', 'medication']
            }
            
            # Check keywords
            for claim_type, keywords in claim_type_keywords.items():
                if any(keyword in text_lower for keyword in keywords):
                    return claim_type
            
            # Check procedure codes for dental
            dental_codes = ['D', '0120', '0270', '0272', '0274']
            if any(code.startswith('D') or code in dental_codes for code in codes['procedure_codes']):
                return 'dental'
            
            # Default to medical if no specific indicators found
            return 'medical'
        except Exception as e:
            logger.error(f"Error determining claim type: {str(e)}")
            return 'medical'

    def extract_information(self, text: str) -> Dict[str, Any]:
        """Extract all relevant information from the text"""
        try:
            logger.info("Starting information extraction")
            
            # Extract codes first as they're needed for claim type determination
            codes = self.extract_codes(text)
            
            extracted_data = {
                'date_of_service': self.extract_date(text),
                'amount': self.extract_amount(text),
                'claim_type': self.determine_claim_type(text, codes),
                'diagnosis_codes': codes['diagnosis_codes'],
                'procedure_codes': codes['procedure_codes']
            }
            
            # Extract names
            names = self.extract_names(text)
            extracted_data.update(names)
            
            logger.info("Information extraction completed")
            return extracted_data
            
        except Exception as e:
            logger.error(f"Error in information extraction: {str(e)}")
            raise 