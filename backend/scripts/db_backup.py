"""
db_backup.py - SQLite / Database automated backup utility.
"""
import shutil
import os
from datetime import datetime

def backup_sqlite_db(source_path: str = "shebabd.db", backup_dir: str = "backups") -> str:
    """Create timestamped copy of SQLite database file."""
    if not os.path.exists(source_path):
        return "Source DB not found"
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    target_path = os.path.join(backup_dir, f"shebabd_{timestamp}.db")
    shutil.copy2(source_path, target_path)
    return target_path

if __name__ == "__main__":
    result = backup_sqlite_db()
    print(f"Backup created at: {result}")
