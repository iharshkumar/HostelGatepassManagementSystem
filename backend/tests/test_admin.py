def test_admin_dashboard_and_users(client):
    reg = client.post("/api/auth/register", json={
        "fullName": "System Admin",
        "email": "admin@test.com",
        "password": "password123",
        "role": "Admin"
    }).get_json()
    token = reg["data"]["token"]

    stats_res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
    assert stats_res.status_code == 200
    assert stats_res.get_json()["success"] is True

    users_res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert users_res.status_code == 200
    assert len(users_res.get_json()["data"]) >= 1
