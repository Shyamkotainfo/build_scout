from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)

def test_api_can_be_imported():
    from api.main import app as _app  # noqa
    assert _app is not None

def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200

def test_health_response_is_correct():
    response = client.get("/health")
    assert response.json() == {"status": "healthy"}
