import time
import json
import requests

def run_test():
    prompt = "Build an AI document intelligence platform using AWS. It should allow users to upload PDF documents, extract text using OCR, store documents securely, provide semantic search and question answering using RAG, support user authentication, and expose APIs for integration with other enterprise systems. Prefer reusable open-source solutions where appropriate, but ensure the selected components have suitable licenses and acceptable security/maturity."
    
    post_url = "http://127.0.0.1:8002/api/v1/analyses"
    post_payload = {"user_request": prompt}
    
    print("Waiting for server to be ready...")
    ready = False
    for i in range(30):
        try:
            resp = requests.get("http://127.0.0.1:8002/health")
            if resp.status_code == 200:
                ready = True
                print("Server is up!")
                break
        except requests.exceptions.ConnectionError:
            time.sleep(1)

    if not ready:
        print("Server did not become ready.")
        return

    print("\nSending POST request (this will take several minutes)...")
    start_time = time.time()
    try:
        post_resp = requests.post(post_url, json=post_payload, timeout=900)
    except requests.exceptions.Timeout:
        print("POST request timed out after 15 minutes!")
        return
        
    end_time = time.time()
    print(f"POST completed in {end_time - start_time:.2f} seconds. Status: {post_resp.status_code}")
    
    try:
        post_json = post_resp.json()
        with open("post_response.json", "w") as f:
            json.dump(post_json, f, indent=2)
            
        analysis_id = post_json.get("analysis_id")
        print(f"Analysis ID: {analysis_id}")
        
        if analysis_id:
            print(f"\nSending GET request for {analysis_id}...")
            get_url = f"http://127.0.0.1:8002/api/v1/analyses/{analysis_id}"
            get_resp = requests.get(get_url)
            print(f"GET Status: {get_resp.status_code}")
            
            with open("get_response.json", "w") as f:
                try:
                    json.dump(get_resp.json(), f, indent=2)
                except Exception:
                    f.write(get_resp.text)
    except Exception as e:
        print(f"Error parsing response: {e}")
        with open("post_response.txt", "w") as f:
            f.write(post_resp.text)

if __name__ == "__main__":
    run_test()
