def test_student_profile(client):
    reg = client.post("/api/auth/register", json={
        "fullName": "Student Profile User",
        "email": "profile_student@test.com",
        "password": "password123",
        "role": "Student",
        "department": "Computer Science",
        "semester": 4
    }).get_json()
    token = reg["data"]["token"]

    res = client.get("/api/student/profile", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["email"] == "profile_student@test.com"
