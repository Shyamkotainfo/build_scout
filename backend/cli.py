#!/usr/bin/env python3
"""
cli.py — Run the full BuildSmart workflow from the command line (no API).

Usage:
    python cli.py "Build an AI document intelligence platform using AWS"
"""

import sys
import json
import logging
from pprint import pprint

# Configure logging before importing BuildSmart modules
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)-8s %(name)s: %(message)s"
)

from services.analysis_service import analyze
from api.exceptions import BuildSmartAPIException

def main():
    if len(sys.argv) < 2:
        print("Usage: python cli.py <your_request>")
        print("Example: python cli.py 'Build a serverless web app using AWS'")
        sys.exit(1)

    user_request = sys.argv[1]
    print(f"\n🚀 Starting BuildSmart Analysis")
    print(f"Request: {user_request}\n" + "-"*50)

    try:
        # Run the full LangGraph workflow
        result = analyze(user_request)
        
        print("\n✅ Analysis Complete!\n" + "="*50)
        
        # Convert Pydantic model to dictionary and print nicely
        result_dict = result.model_dump()
        
        print(f"Analysis ID: {result_dict['analysis_id']}")
        print(f"Status:      {result_dict['status']}")
        
        if result_dict.get('llm_metrics'):
            print(f"Metrics:     {result_dict['llm_metrics']['total_tokens']} tokens, "
                  f"{result_dict['llm_metrics']['total_latency_ms']} ms")
        
        print("\nBlueprint:")
        if result_dict.get('blueprint'):
            print(json.dumps(result_dict['blueprint'], indent=2))
        else:
            print("No blueprint generated.")
            
    except BuildSmartAPIException as e:
        print(f"\n❌ Workflow Failed: {e.code} - {e.message}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
