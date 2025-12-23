from fastapi.testclient import TestClient

from app.main import app


def test_seed_blocked_outside_dev(monkeypatch):
    monkeypatch.setenv("APP_ENV", "mvp_canon")
    monkeypatch.setenv("ADMIN_API_KEY", "secret")
    client = TestClient(app)

    response = client.post("/models/seed", headers={"X-Admin-Key": "secret"})

    assert response.status_code == 403
    assert response.json()["detail"] == "Seeding is only available in dev"
