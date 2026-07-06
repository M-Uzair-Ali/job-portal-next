import pdfplumber
import re

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            # use layout-aware extraction to preserve spacing
            page_text = page.extract_text(x_tolerance=2, y_tolerance=2)
            if page_text:
                text += page_text + "\n"

    # only fix clear run-together lowercase words (not camelCase or tech terms)
    text = re.sub(r'([a-z]{2})([A-Z][a-z])', r'\1 \2', text)

    # fix multiple spaces
    text = re.sub(r' +', ' ', text)

    return text.strip()

if __name__ == "__main__":
    pdf_path = r"D:\rag\resume.pdf"

    print("Extracting text from PDF...\n")
    text = extract_text_from_pdf(pdf_path)

    print("Extracted Text:")
    print("-" * 40)
    print(text)
    print("-" * 40)
    print(f"\nTotal characters extracted: {len(text)}")