"""
init_clean_db.py — Initialize a completely clean, production-ready database.

Actions:
1. Backs up existing database to shebabd.db.backup
2. Drops and recreates all tables cleanly according to app.models
3. Seeds essential payment gateway records (bKash, Nagad, Bank Transfer)
4. Seeds your initial Super Admin account (ready for production login)
5. Leaves all NGO, Blood Donor, Volunteer, and Event tables 100% EMPTY for your real data.
"""
import asyncio
import os
import shutil
import sys
from decimal import Decimal
import bcrypt

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, AsyncSessionLocal
from app import models
from app.models import User, PaymentMethod, PaymentProvider

ADMIN_NAME = "Fahim Muntasir"
ADMIN_EMAIL = "mdfahimuntasir1488.csenub@gmail.com"
ADMIN_PASSWORD = "password123"  # Change this after first login in production

PAYMENT_METHODS = [
    {
        "provider": PaymentProvider.BKASH,
        "name": "bkash",
        "display_name": "bKash",
        "description": "Pay securely with your bKash mobile account",
        "min_amount": Decimal("10.00"),
        "max_amount": Decimal("25000.00"),
        "config": {
            "app_key": "bkash_prod_key",
            "app_secret": "bkash_prod_secret",
            "username": "bkash_username",
            "password": "bkash_password",
            "base_url": "https://checkout.pay.bka.sh/v1.2.0-beta",
        },
        "is_active": True,
    },
    {
        "provider": PaymentProvider.NAGAD,
        "name": "nagad",
        "display_name": "Nagad",
        "description": "Pay securely with your Nagad wallet",
        "min_amount": Decimal("10.00"),
        "max_amount": Decimal("25000.00"),
        "config": {
            "merchant_id": "nagad_merchant_id",
            "merchant_private_key": "nagad_private_key",
            "nagad_public_key": "nagad_public_key",
            "base_url": "https://api.mynagad.com/api/dfs",
        },
        "is_active": True,
    },
    {
        "provider": PaymentProvider.BANK,
        "name": "bank_transfer",
        "display_name": "Bank Transfer",
        "description": "Direct bank deposit / electronic fund transfer",
        "min_amount": Decimal("100.00"),
        "max_amount": Decimal("1000000.00"),
        "config": {
            "bank_name": "Dutch-Bangla Bank Limited (DBBL)",
            "account_name": "ShebaBD Foundation",
            "account_number": "123.120.123456",
            "branch_name": "Dhanmondi Branch, Dhaka",
            "routing_number": "090271234",
            "instructions": "Please deposit funds and upload receipt proof for instant verification.",
        },
        "is_active": True,
    },
]

async def reset_database():
    db_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shebabd.db")
    backup_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shebabd.db.backup")

    if os.path.exists(db_file):
        print(f"Creating backup: {backup_file}...")
        shutil.copy2(db_file, backup_file)

    print("Recreating database schema (clean empty tables)...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Schema initialized.")

    async with AsyncSessionLocal() as session:
        # 1. Create Primary Admin Account
        print(f"Creating primary Admin account: {ADMIN_EMAIL}...")
        hashed_pw = bcrypt.hashpw(ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        admin_user = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            hashed_password=hashed_pw,
            role="admin",
        )
        session.add(admin_user)

        # 2. Add Payment Gateways
        print("Configuring payment gateway channels (bKash, Nagad, Bank Transfer)...")
        for pm_data in PAYMENT_METHODS:
            pm = PaymentMethod(**pm_data)
            session.add(pm)

        await session.commit()
        print("[OK] Payment methods initialized.")

    print("\n" + "="*60)
    print(" CLEAN PRODUCTION DATABASE READY!")
    print("="*60)
    print(f" Admin Account:  {ADMIN_EMAIL}")
    print(f" Password:       {ADMIN_PASSWORD}")
    print(" All NGOs, Blood Donors, Volunteers & Events are 100% clean.")
    print(" You can now add your real organizations and data from the UI!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(reset_database())
