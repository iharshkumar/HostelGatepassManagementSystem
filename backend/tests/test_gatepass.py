def test_gatepass_workflow(client):
    # Register student
    reg_student = client.post("/api/auth/register", json={
        "fullName": "Student Gatepass User",
        "email": "gatepass_student@test.com",
        "password": "password123",
        "role": "Student"
    }).get_json()
    student_token = reg_student["data"]["token"]

    # Register Warden
    reg_warden = client.post("/api/auth/register", json={
        "fullName": "Warden User",
        "email": "warden@test.com",
        "password": "password123",
        "role": "Warden"
    }).get_json()
    warden_token = reg_warden["data"]["token"]

    # Student applies for gatepass
    apply_res = client.post("/api/gatepass/apply", json={
        "reason": "Home Visit",
        "destination": "New Delhi",
        "leaveDate": "2026-08-01T10:00:00Z",
        "returnDate": "2026-08-05T18:00:00Z"
    }, headers={"Authorization": f"Bearer {student_token}"})

    assert apply_res.status_code == 201
    gp_data = apply_res.get_json()["data"]
    gp_id = gp_data["id"]

    # Warden approves gatepass
    approve_res = client.put(f"/api/gatepass/{gp_id}/approve", json={
        "remarks": "Approved by chief warden"
    }, headers={"Authorization": f"Bearer {warden_token}"})

    assert approve_res.status_code == 200
    assert approve_res.get_json()["success"] is True
