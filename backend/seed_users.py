#!/usr/bin/env python3
"""
seed_users.py — Create some test users in the database.

Run this once after the backend is running to populate the database with test users.
"""
import asyncio
import asyncpg
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User
from app.config import get_settings
import bcrypt

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode()[:72], bcrypt.gensalt()).decode()

async def create_test_users():
    settings = get_settings()
    
    # Create engine
    engine = create_async_engine(
        settings.database_url,
        echo=True if settings.debug else False,
    )
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Test users
        test_users = [
            {
                "name": "John Doe",
                "email": "user@shebabd.org", 
                "password": "password123",
                "role": "user"
            },
            {
                "name": "Sarah Ahmed",
                "email": "volunteer@shebabd.org",
                "password": "password123", 
                "role": "volunteer"
            },
            {
                "name": "BRAC Foundation",
                "email": "ngo@shebabd.org",
                "password": "password123",
                "role": "ngo"
            },
            {
                "name": "Admin User", 
                "email": "admin@shebabd.org",
                "password": "password123",
                "role": "admin"
            }
        ]
        
        for user_data in test_users:
            # Check if user exists
            from sqlalchemy import select
            result = await session.execute(select(User).where(User.email == user_data["email"]))
            existing_user = result.scalars().first()
            
            if not existing_user:
                user = User(
                    name=user_data["name"],
                    email=user_data["email"], 
                    hashed_password=hash_password(user_data["password"]),
                    role=user_data["role"],
                    avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                )
                session.add(user)
                print(f"Creating user: {user_data['email']} ({user_data['role']})")
            else:
                print(f"User already exists: {user_data['email']}")
                
        await session.commit()
        print("\n✓ Test users created successfully!")
        print("\nYou can now sign in with:")
        print("  user@shebabd.org / password123 (User)")  
        print("  volunteer@shebabd.org / password123 (Volunteer)")
        print("  ngo@shebabd.org / password123 (NGO)")
        print("  admin@shebabd.org / password123 (Admin)")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_test_users())