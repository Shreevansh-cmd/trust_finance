from fastapi import APIRouter
from database.db import get_db

router = APIRouter()

@router.get("/admin/users")
def get_users():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, trust_score, risk_level, income, spending, savings FROM users")
        users = [dict(row) for row in cursor.fetchall()]
        
    return {"users": users}
