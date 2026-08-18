"""
geo_helpers.py — Geographic helper utilities for ShebaBD location features.

Provides district validation, proximity calculations,
and Bangladesh division mapping used for blood donor matching
and organization filtering.
"""
import math

# Bangladesh divisions and their districts
BD_DIVISIONS: dict[str, list[str]] = {
    "Dhaka": [
        "Dhaka", "Gazipur", "Narayanganj", "Narsingdi", "Manikganj",
        "Munshiganj", "Tangail", "Faridpur", "Gopalganj", "Madaripur",
    ],
    "Chittagong": [
        "Chittagong", "Cox's Bazar", "Comilla", "Noakhali", "Feni",
        "Lakshmipur", "Chandpur", "Brahmanbaria",
    ],
    "Sylhet": ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
    "Rajshahi": ["Rajshahi", "Bogura", "Natore", "Naogaon", "Chapai Nawabganj"],
    "Khulna": ["Khulna", "Jessore", "Satkhira", "Bagerhat", "Narail"],
    "Barisal": ["Barisal", "Bhola", "Patuakhali", "Pirojpur", "Jhalokati"],
    "Mymensingh": ["Mymensingh", "Jamalpur", "Sherpur", "Netrokona"],
    "Rangpur": ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Nilphamari"],
}

# Approximate lat/lon center points of major districts
DISTRICT_COORDS: dict[str, tuple[float, float]] = {
    "Dhaka":      (23.8103, 90.4125),
    "Chittagong": (22.3569, 91.7832),
    "Sylhet":     (24.8949, 91.8687),
    "Rajshahi":   (24.3745, 88.6042),
    "Khulna":     (22.8456, 89.5403),
    "Barisal":    (22.7010, 90.3535),
    "Mymensingh": (24.7471, 90.4203),
    "Rangpur":    (25.7439, 89.2752),
    "Gazipur":    (23.9999, 90.4203),
    "Cox's Bazar":(21.4272, 92.0058),
}


def get_division(district: str) -> str | None:
    """Return the division name for a given district."""
    for division, districts in BD_DIVISIONS.items():
        if district in districts:
            return division
    return None


def get_nearby_districts(district: str, max_km: float = 100.0) -> list[str]:
    """
    Return list of districts within max_km of the given district.
    Uses Haversine formula for distance calculation.
    """
    if district not in DISTRICT_COORDS:
        return []
    lat1, lon1 = DISTRICT_COORDS[district]
    nearby = []
    for other, (lat2, lon2) in DISTRICT_COORDS.items():
        if other == district:
            continue
        dist = _haversine(lat1, lon1, lat2, lon2)
        if dist <= max_km:
            nearby.append(other)
    return nearby


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two lat/lon points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi   = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def is_valid_district(district: str) -> bool:
    """Check if a district name is recognized in Bangladesh."""
    all_districts = [d for ds in BD_DIVISIONS.values() for d in ds]
    return district in all_districts
