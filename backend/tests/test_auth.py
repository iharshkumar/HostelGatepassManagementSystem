import json

def test_user_registration_and_login(client):
    # Test Register Student
    reg_payload = {
        "fullName": "Test Student",
        "email": "student@test.com",
        "password": "password123",
        "role": "Student",
        "hostel": "Block A",
        "roomNumber": "101",
        "phone": "9876543210"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "token" in data["data"]

    # Test Duplicate Registration
    res_dup = client.post("/api/auth/register", json=reg_payload)
    assert res_dup.status_code == 400
    assert res_dup.get_json()["success"] is False

    # Test Login
    login_payload = {
        "email": "student@test.com",
        "password": "password123"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.get_json()
    assert login_data["success"] is True
    assert "token" in login_data["data"]
