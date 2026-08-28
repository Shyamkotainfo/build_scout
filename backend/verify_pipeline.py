import asyncio
import logging
import json
from services.analysis_service import analyze
from database.connection import init_db

logging.basicConfig(level=logging.INFO)

def test_pipeline():
    init_db()
    print("\n--- Running BuildScout Pipeline ---")
    try:
        result = analyze("Build a Go-based document processing service that accepts documents through an API, extracts text, stores document metadata, and provides fast search over the extracted content. It should be secure, scalable, and use reusable open-source components where appropriate.")
        print("\n--- Pipeline Result ---")
        print(f"Analysis ID: {result.analysis_id}")
        print(f"Status: {result.status}")
        print(f"Total Components: {len(result.components)}")
    except Exception as e:
        print(f"Pipeline Error: {e}")

if __name__ == "__main__":
    test_pipeline()
