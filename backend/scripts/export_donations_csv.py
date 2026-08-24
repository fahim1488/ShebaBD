"""
export_donations_csv.py - Export donation records to CSV format for audit trails.
"""
import csv
import io
from typing import List, Dict

def export_records_to_csv(donations: List[Dict[str, str]]) -> str:
    """Serialize list of donation records into CSV string."""
    output = io.StringIO()
    if not donations:
        return ""
    writer = csv.DictWriter(output, fieldnames=donations[0].keys())
    writer.writeheader()
    writer.writerows(donations)
    return output.getvalue()
