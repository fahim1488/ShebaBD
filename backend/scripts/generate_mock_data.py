"""
generate_mock_data.py - Performance testing mock data utility.
"""
from typing import List, Dict

def generate_mock_donors(count: int = 5) -> List[Dict[str, str]]:
    """Generate dummy donor profiles for load testing."""
    groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    cities = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"]
    donors = []
    for i in range(count):
        donors.append({
            "name": f"Donor {i+1}",
            "blood_group": groups[i % len(groups)],
            "city": cities[i % len(cities)],
            "phone": f"+880170000000{i}"
        })
    return donors
