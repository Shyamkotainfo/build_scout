import os
import sys
import time
import json
import requests
import subprocess
import signal

def run_test():
    print("Starting FastAPI server...")
    # Start the server
    server_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "127.0.0.1", "--port", "8001"],
        cwd="/Users/Shyam/Desktop/Hackathon_2026/build_scout/backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    # Wait for server to start
    started = False
    for i in range(15):
        try:
            resp = requests.get("http://127.0.0.1:8001/health")
            if resp.status_code == 200:
                started = True
                print("Server started successfully.")
                break
        except requests.exceptions.ConnectionError:
            time.sleep(1)

    if not started:
        print("Failed to start server.")
        server_process.kill()
        sys.exit(1)

    try:
        print("\nSending POST request...")
        prompt = "Build an AI document intelligence platform using AWS. It should allow users to upload PDF documents, extract text using OCR, store documents securely, provide semantic search and question answering using RAG, support user authentication, and expose APIs for integration with other enterprise systems. Prefer reusable open-source solutions where appropriate, but ensure the selected components have suitable licenses and acceptable security/maturity."
        
        post_url = "http://127.0.0.1:8001/api/v1/analyses"
        post_payload = {"user_request": prompt}
        
        start_time = time.time()
        post_resp = requests.post(post_url, json=post_payload, timeout=600)
        end_time = time.time()
        
        print(f"POST completed in {end_time - start_time:.2f} seconds. Status: {post_resp.status_code}")
        
        post_json = post_resp.json()
        with open("post_response.json", "w") as f:
            json.dump(post_json, f, indent=2)
            
        analysis_id = post_json.get("analysis_id")
        print(f"Analysis ID: {analysis_id}")
        
        if analysis_id:
            print(f"\nSending GET request for {analysis_id}...")
            get_url = f"http://127.0.0.1:8001/api/v1/analyses/{analysis_id}"
            get_resp = requests.get(get_url)
            print(f"GET Status: {get_resp.status_code}")
            
            with open("get_response.json", "w") as f:
                try:
                    json.dump(get_resp.json(), f, indent=2)
                except:
                    f.write(get_resp.text)
                    
    except Exception as e:
        print(f"Error during test: {e}")
    finally:
        print("Shutting down server...")
        server_process.send_signal(signal.SIGTERM)
        server_process.wait()

if __name__ == "__main__":
    run_test()
