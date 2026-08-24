#!/usr/bin/env python3
"""
Test script to verify auth endpoints are working
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_register():
    """Test user registration"""
    print("Testing registration...")
    
    payload = {
        "name": "Test User",
        "email": "test@example.com", 
        "password": "password123",
        "role": "user"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print(f"Registration status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("✓ Registration successful!")
            print(f"Token: {data.get('token', 'N/A')}")
            print(f"User: {data.get('user', {}).get('name', 'N/A')}")
            return data.get('token')
        elif response.status_code == 409:
            print("! User already exists, trying login...")
            return test_login("test@example.com", "password123")
        else:
            print(f"✗ Registration failed: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Registration error: {e}")
        return None

def test_login(email="test@example.com", password="password123"):
    """Test user login"""
    print(f"Testing login for {email}...")
    
    payload = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        print(f"Login status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Login successful!")
            print(f"Token: {data.get('token', 'N/A')}")
            print(f"User: {data.get('user', {}).get('name', 'N/A')}")
            return data.get('token')
        else:
            print(f"✗ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Login error: {e}")
        return None

def test_me(token):
    """Test getting user profile"""
    print("Testing /auth/me endpoint...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Profile status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Profile retrieved!")
            print(f"User: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"✗ Profile failed: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Profile error: {e}")
        return False

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Backend is healthy!")
            print(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"✗ Health check failed: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False

if __name__ == "__main__":
    print("=== ShebaBD Auth System Test ===\n")
    
    # Test health first
    if not test_health():
        print("Backend is not running. Please start the backend first.")
        exit(1)
    
    print()
    
    # Test registration/login
    token = test_register()
    if not token:
        token = test_login()
    
    if token:
        print()
        test_me(token)
        print("\n✓ All auth tests completed!")
    else:
        print("\n✗ Auth tests failed!")