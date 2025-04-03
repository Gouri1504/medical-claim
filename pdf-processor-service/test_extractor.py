from ai_extractor import MedicalDocumentExtractor

def test_extractor():
    try:
        # Initialize the extractor
        extractor = MedicalDocumentExtractor()
        
        # Sample medical document text
        sample_text = """
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
        """
        
        # Extract information
        result = extractor.extract_information(sample_text)
        
        # Print results
        print("\nExtracted Information:")
        print(f"Patient Name: {result['patient_name']}")
        print(f"Provider Name: {result['provider_name']}")
        print(f"Date of Service: {result['date_of_service']}")
        print(f"Amount: ${result['amount']}")
        print(f"Claim Type: {result['claim_type']}")
        print(f"Diagnosis Codes: {result['diagnosis_codes']}")
        print(f"Procedure Codes: {result['procedure_codes']}")
        
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_extractor() 