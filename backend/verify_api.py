import logging
from fastapi.testclient import TestClient
from api.main import app

logging.basicConfig(level=logging.INFO)

def test_api():
    client = TestClient(app)
    
    # 1. Health check
    response = client.get("/health")
    print(f"Health Check: {response.status_code}")
    print(response.json())
    
    # 2. List analyses
    response = client.get("/api/v1/analyses")
    print(f"\nList Analyses: {response.status_code}")
    analyses = response.json()
    print(f"Found {len(analyses)} analyses.")
    
    # 3. Get specific analysis
    if analyses:
        target_id = analyses[0]["analysis_id"]
        # Use our E2E run if it's there
        for a in analyses:
            if a["analysis_id"] == "d61994d5-ff7c-47fc-8f78-a28c387b9264":
                target_id = a["analysis_id"]
                break
                
        print(f"\nFetching Analysis: {target_id}")
        response = client.get(f"/api/v1/analyses/{target_id}")
        print(f"Fetch Analysis: {response.status_code}")
        data = response.json()
        print(f"Status: {data.get('status')}")
        print(f"Requirements: {len(data.get('requirements', []))}")

if __name__ == "__main__":
    test_api()
