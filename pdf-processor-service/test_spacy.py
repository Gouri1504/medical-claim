import spacy

def test_spacy():
    try:
        # Load the English language model
        nlp = spacy.load("en_core_web_sm")
        print("✅ spaCy loaded successfully")
        
        # Test with a sample text
        text = "John Smith visited Dr. Johnson on January 15, 2023 for a medical checkup."
        doc = nlp(text)
        
        # Print named entities
        print("\nNamed Entities:")
        for ent in doc.ents:
            print(f"- {ent.text} ({ent.label_})")
            
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_spacy() 