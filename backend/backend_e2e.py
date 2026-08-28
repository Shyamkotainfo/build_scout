import httpx
import asyncio
import json

async def run():
    report = []
    def log(msg):
        print(msg)
        report.append(msg)

    base_url = "http://localhost:8000"

    try:
        log('\n## PHASE 11: API Contract Verification')
        async with httpx.AsyncClient() as client:
            # 1. Health
            resp = await client.get(f"{base_url}/health")
            if resp.status_code == 200:
                log("✓ PASS: GET /health returned 200 OK.")
            else:
                log(f"✗ FAIL: GET /health returned {resp.status_code}")

            # 2. Create Analysis
            log('\n## PHASE 3: Run a New Analysis')
            payload = {
                "user_request": "Build an AI document intelligence platform using AWS. It should allow users to upload PDF documents, extract text using OCR, store documents securely, provide semantic search and question answering using RAG, support user authentication, and expose APIs for integration with other enterprise systems. Prefer reusable open-source solutions where appropriate, but ensure the selected components have suitable licenses and acceptable security/maturity."
            }
            log("Sending POST /api/v1/analyses... (this may take a minute)")
            resp = await client.post(f"{base_url}/api/v1/analyses", json=payload, timeout=300.0)
            if resp.status_code in (200, 201):
                data = resp.json()
                analysis_id = data.get("analysis_id")
                log(f"✓ PASS: Successfully created analysis {analysis_id}")
            else:
                log(f"✗ FAIL: POST /api/v1/analyses returned {resp.status_code}: {resp.text}")
                return

            # 3. GET Analyses List
            resp = await client.get(f"{base_url}/api/v1/analyses")
            if resp.status_code == 200:
                analyses = resp.json().get("analyses", resp.json())
                if isinstance(analyses, list) and len(analyses) > 0:
                    log(f"✓ PASS: GET /api/v1/analyses returned {len(analyses)} items.")
                    first = analyses[0]
                    # Verify fields
                    for field in ['analysis_id', 'created_at', 'status', 'decision_summary', 'validation_score']:
                        if field in first:
                            log(f"✓ PASS: List item contains field '{field}'.")
                        else:
                            log(f"✗ FAIL: List item MISSING field '{field}'.")
                else:
                    log("✗ FAIL: GET /api/v1/analyses returned empty or invalid shape.")
            else:
                log(f"✗ FAIL: GET /api/v1/analyses failed.")

            # 4. GET Single Analysis
            resp = await client.get(f"{base_url}/api/v1/analyses/{analysis_id}")
            if resp.status_code == 200:
                single = resp.json()
                log(f"✓ PASS: GET /api/v1/analyses/{analysis_id} returned 200.")
                for field in ['analysis_id', 'created_at', 'updated_at', 'status', 'requirements', 'components']:
                    if field in single:
                        log(f"✓ PASS: Single analysis contains field '{field}'.")
                    else:
                        log(f"✗ FAIL: Single analysis MISSING field '{field}'.")
            else:
                log(f"✗ FAIL: GET /api/v1/analyses/{analysis_id} failed.")

    except Exception as e:
        log("ERROR: " + str(e))
    finally:
        with open("../backend_e2e_acceptance_report.md", "w") as f:
            f.write("\n".join(report))

if __name__ == "__main__":
    asyncio.run(run())
