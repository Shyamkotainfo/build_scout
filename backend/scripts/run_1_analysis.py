import requests
import time
import json
import os

BASE_URL = "http://localhost:8000/api/v1"

PROMPTS = [
    "AI document intelligence platform using AWS, OCR, secure storage, RAG, authentication and APIs.",
    "Enterprise customer-support platform using RAG, vector search, authentication, APIs and cloud deployment.",
    "Financial document processing platform with OCR, PII detection, secure storage, search and auditability."
]

def run_analyses():
    results = []
    
    print("Starting 3 analyses...")
    
    for i, prompt in enumerate(PROMPTS):
        print(f"--- Analysis {i+1}/3 ---")
        print(f"Prompt: {prompt}")
        
        # Submit
        try:
            resp = requests.post(f"{BASE_URL}/analyses", json={"user_request": prompt})
        except Exception as e:
            print(f"Connection error: {e}")
            break
            
        if resp.status_code != 200:
            print(f"Error submitting analysis: {resp.status_code} {resp.text}")
            continue
            
        data = resp.json()
        analysis_id = data.get("analysis_id")
        if not analysis_id:
            print(f"No analysis_id in response: {data}")
            continue
            
        print(f"Submitted. ID: {analysis_id}")
        
        # Poll for completion
        start_time = time.time()
        while True:
            poll_resp = requests.get(f"{BASE_URL}/analyses/{analysis_id}/status")
            if poll_resp.status_code == 200:
                poll_data = poll_resp.json()
                status = poll_data.get("status")
                
                print(f"Status: {status}", end="\r")
                
                if status in ["COMPLETED", "FAILED"]:
                    print(f"\nFinished with status: {status}")
                    
                    # Fetch full details
                    full_resp = requests.get(f"{BASE_URL}/analyses/{analysis_id}")
                    if full_resp.status_code == 200:
                        full_data = full_resp.json()
                        full_data["_runtime_seconds"] = time.time() - start_time
                        results.append(full_data)
                    else:
                        print(f"Failed to fetch full analysis: {full_resp.status_code}")
                        poll_data["_runtime_seconds"] = time.time() - start_time
                        results.append(poll_data)
                    
                    if i < len(PROMPTS) - 1:
                        print("Waiting 30 seconds to avoid API rate limits...")
                        time.sleep(30)
                    break
            else:
                print(f"\nError polling: {poll_resp.status_code}")
                break
                
            time.sleep(5)
            
    # Save results
    out_path = os.path.join(os.path.dirname(__file__), "..", "run_10_results.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
        
    print(f"All {len(results)} analyses finished. Saved results to {out_path}.")

if __name__ == "__main__":
    run_analyses()
