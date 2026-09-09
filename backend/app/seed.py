"""Bootstrap the first administrator account.

Idempotent. Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME
(and SEED_ADMIN_PHONE / SEED_ADMIN_COUNTRY) from the environment, creating a
staff ADMIN user if no such email exists yet. The password must be at least
8 characters.

Usage:
    SEED_ADMIN_EMAIL=owner@example.com SEED_ADMIN_PASSWORD='change-me-now' \\
        SEED_ADMIN_NAME='Owner' .venv/bin/python -m app.seed
"""

import os
import sys

from sqlalchemy import select

from app import models, security
from app.database import SessionLocal


def main() -> int:
    email = os.getenv("SEED_ADMIN_EMAIL", "").strip().lower()
    password = os.getenv("SEED_ADMIN_PASSWORD", "")
    name = os.getenv("SEED_ADMIN_NAME", "Site Admin").strip()

    if not email or "@" not in email:
        print("Set SEED_ADMIN_EMAIL to a valid address.", file=sys.stderr)
        return 1
    if len(password) < 8:
        print("Set SEED_ADMIN_PASSWORD to at least 8 characters.", file=sys.stderr)
        return 1

    with SessionLocal() as session:
        existing = session.scalar(select(models.User).where(models.User.email == email))
        if existing is not None:
            print(f"Admin already exists for {email} — nothing to do.")
            return 0

        user = models.User(
            email=email,
            password_hash=security.hash_password(password),
            full_name=name,
            phone=os.getenv("SEED_ADMIN_PHONE", ""),
            country=os.getenv("SEED_ADMIN_COUNTRY", ""),
            role="ADMIN",
            is_staff=True,
            is_active=True,
        )
        session.add(user)
        session.commit()
        print(f"Created ADMIN user {email} ({name}).")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())