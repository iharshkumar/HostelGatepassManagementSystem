def test_security_guard_workflow(client):
    # 1. Register Student
    reg_student = client.post("/api/auth/register", json={
        "fullName": "Rahul Verma",
        "email": "rahul.student@test.com",
        "password": "password123",
        "role": "Student"
    }).get_json()
    student_token = reg_student["data"]["token"]

    # 2. Register Warden
    reg_warden = client.post("/api/auth/register", json={
        "fullName": "Warden Sharma",
        "email": "sharma.warden@test.com",
        "password": "password123",
        "role": "Warden"
    }).get_json()
    warden_token = reg_warden["data"]["token"]

    # 3. Register Security Guard
    reg_guard = client.post("/api/auth/register", json={
        "fullName": "Guard Officer Singh",
        "email": "singh.guard@test.com",
        "password": "password123",
        "role": "Security Guard"
    })
    assert reg_guard.status_code == 201
    guard_token = reg_guard.get_json()["data"]["token"]

    # 4. Student applies for Gatepass
    apply_res = client.post("/api/gatepass/apply", json={
        "reason": "Weekend Visit",
        "destination": "Market",
        "leaveDate": "2026-08-01T10:00:00Z",
        "returnDate": "2026-08-01T18:00:00Z"
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert apply_res.status_code == 201
    gp_id = apply_res.get_json()["data"]["id"]

    # 5. Guard attempt to check out before approval (should fail with 400)
    checkout_fail = client.put(f"/api/gatepass/{gp_id}/check-out", json={}, headers={"Authorization": f"Bearer {guard_token}"})
    assert checkout_fail.status_code == 400

    # 6. Warden approves Gatepass
    client.put(f"/api/gatepass/{gp_id}/approve", json={"remarks": "Granted"}, headers={"Authorization": f"Bearer {warden_token}"})

    # 7. Security Guard Checks Out Student
    checkout_res = client.put(f"/api/gatepass/{gp_id}/check-out", json={}, headers={"Authorization": f"Bearer {guard_token}"})
    assert checkout_res.status_code == 200
    assert checkout_res.get_json()["success"] is True

    # 8. Security Guard Checks In Student
    checkin_res = client.put(f"/api/gatepass/{gp_id}/check-in", json={}, headers={"Authorization": f"Bearer {guard_token}"})
    assert checkin_res.status_code == 200
    assert checkin_res.get_json()["success"] is True

    # 9. Verify history reflects Checked In status
    history_res = client.get("/api/gatepass", headers={"Authorization": f"Bearer {guard_token}"})
    assert history_res.status_code == 200
    passes = history_res.get_json()["data"]
    target = next((p for p in passes if p["id"] == gp_id), None)
    assert target is not None
    assert target["status"] == "Checked In"
    assert target["checkOutBy"] == "Guard Officer Singh"
    assert target["checkInBy"] == "Guard Officer Singh"
