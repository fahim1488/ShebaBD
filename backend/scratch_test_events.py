import httpx
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    client = httpx.Client(timeout=10.0)
    print("=== 1. TEST USER LOGIN / REGISTER ===")
    user_email = "tester_events@shebabd.org"
    user_password = "password123"
    
    # Try login first, if fail register
    login_res = client.post(f"{BASE_URL}/auth/login", json={"email": user_email, "password": user_password})
    token = None
    if login_res.status_code == 200:
        res_json = login_res.json()
        token = res_json.get("token") or res_json.get("access_token")
        print("Logged in existing test user. Token acquired.")
    else:
        reg_res = client.post(f"{BASE_URL}/auth/register", json={
            "name": "Event Test User",
            "email": user_email,
            "password": user_password,
            "role": "user"
        })
        print(f"Register status: {reg_res.status_code}")
        res_json = reg_res.json()
        token = res_json.get("token") or res_json.get("access_token")
        print("Registered new test user. Token acquired.")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n=== 2. LIST EVENTS ===")
    events_res = client.get(f"{BASE_URL}/events", headers=headers)
    assert events_res.status_code == 200, f"List events failed: {events_res.text}"
    events = events_res.json()
    print(f"Retrieved {len(events)} events.")
    test_event = events[0]
    event_id = test_event["id"]
    print(f"Using Event ID: {event_id} ('{test_event['title']}')")

    # If already registered from a previous run, cancel first to have clean test state
    if test_event.get("is_registered"):
        print("User was already registered from earlier run, cancelling first...")
        del_res = client.delete(f"{BASE_URL}/events/{event_id}/register", headers=headers)
        print(f"Cancel status: {del_res.status_code}")

    print("\n=== 3. REGISTER FOR EVENT ===")
    reg_payload = {"phone": "+8801700000000"}
    reg_res = client.post(f"{BASE_URL}/events/{event_id}/register", json=reg_payload, headers=headers)
    print(f"Registration response status: {reg_res.status_code}")
    print(f"Registration payload: {reg_res.json()}")
    assert reg_res.status_code == 201, f"Expected 201 Created, got {reg_res.status_code}"
    reg_data = reg_res.json()
    assert reg_data["event_id"] == event_id
    assert reg_data["confirmation_sent"] == True, "Confirmation email should be marked as sent"
    print("[OK] Registration successful & confirmation email logged/sent.")

    print("\n=== 4. PREVENT DUPLICATE REGISTRATION ===")
    dup_res = client.post(f"{BASE_URL}/events/{event_id}/register", json=reg_payload, headers=headers)
    print(f"Duplicate registration status: {dup_res.status_code} ({dup_res.json()})")
    assert dup_res.status_code == 409, f"Expected 409 Conflict, got {dup_res.status_code}"
    print("[OK] Duplicate registration correctly rejected with 409 Conflict.")

    print("\n=== 5. CHECK MY REGISTRATIONS ===")
    my_regs_res = client.get(f"{BASE_URL}/events/my-registrations", headers=headers)
    assert my_regs_res.status_code == 200
    my_regs = my_regs_res.json()
    print(f"User has {len(my_regs)} active registration(s):")
    for r in my_regs:
        print(f" - {r.get('event_title')} | Status: {r['status']} | Confirmation Sent: {r['confirmation_sent']}")
    assert any(r["event_id"] == event_id and r["status"] == "confirmed" for r in my_regs)
    print("[OK] User registrations list verified.")

    print("\n=== 6. CHECK EVENT DETAIL WITH REGISTRATION STATUS ===")
    ev_detail_res = client.get(f"{BASE_URL}/events/{event_id}", headers=headers)
    assert ev_detail_res.status_code == 200
    ev_detail = ev_detail_res.json()
    assert ev_detail["is_registered"] == True
    print(f"[OK] Event detail correctly reflects is_registered=True (Reg ID: {ev_detail['user_registration_id']})")

    print("\n=== 7. TRIGGER REMINDER SYSTEM ===")
    rem_res = client.post(f"{BASE_URL}/events/reminders/trigger-now", headers=headers)
    print(f"Reminder trigger status: {rem_res.status_code} ({rem_res.json()})")
    assert rem_res.status_code == 200
    print("[OK] Backend automated reminder system trigger verified.")

    print("\n=== 8. CANCEL REGISTRATION ===")
    del_res = client.delete(f"{BASE_URL}/events/{event_id}/register", headers=headers)
    print(f"Cancel status: {del_res.status_code} ({del_res.json()})")
    assert del_res.status_code == 200
    
    # Verify is_registered is now False
    ev_detail_after = client.get(f"{BASE_URL}/events/{event_id}", headers=headers).json()
    assert ev_detail_after["is_registered"] == False
    print("[OK] Registration successfully cancelled and capacity freed.")

    print("\n==========================================")
    print(" ALL BACKEND EVENT SYSTEM TESTS PASSED! ")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
