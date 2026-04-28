from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db import get_db
from services.scoring import calculate_trust_score

router = APIRouter()

class UserLogin(BaseModel):
    username: str

class UpdateScore(BaseModel):
    income: int
    spending: int
    savings: int

@router.post("/login")
def login(user: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
        db_user = cursor.fetchone()
        
        if not db_user:
            cursor.execute("INSERT INTO users (username) VALUES (?)", (user.username,))
            conn.commit()
            user_id = cursor.lastrowid
        else:
            user_id = db_user["id"]
            
    return {"message": "Login successful", "user_id": user_id, "username": user.username}

@router.get("/dashboard/{user_id}")
def get_dashboard(user_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        db_user = cursor.fetchone()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
            
        cursor.execute("SELECT * FROM loans WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
        loan = cursor.fetchone()
        
    score_data = calculate_trust_score({
        "income": db_user["income"],
        "spending": db_user["spending"],
        "savings": db_user["savings"]
    })
        
    return {
        "user_id": db_user["id"],
        "username": db_user["username"],
        "trust_score": db_user["trust_score"],
        "risk_level": db_user["risk_level"],
        "loan_limit": db_user["income"] * 3,  # Example simple limit logic
        "financial_summary": {
            "income": db_user["income"],
            "spending": db_user["spending"],
            "savings": db_user["savings"],
        },
        "loan_status": dict(loan) if loan else None,
        "explanation": {
            "reasons": score_data["reasons"],
            "suggestions": score_data["suggestions"]
        }
    }

@router.post("/update-financials/{user_id}")
def update_financials(user_id: int, data: UpdateScore):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # calculate new score
        score_res = calculate_trust_score(data.model_dump())
        new_score = score_res["score"]
        
        cursor.execute("""
            UPDATE users 
            SET income = ?, spending = ?, savings = ?, trust_score = ?
            WHERE id = ?
        """, (data.income, data.spending, data.savings, new_score, user_id))
        conn.commit()
        
    return score_res
