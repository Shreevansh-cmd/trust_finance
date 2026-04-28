from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db import get_db
from services.loan_engine import check_eligibility

router = APIRouter()

class LoanApplication(BaseModel):
    user_id: int

@router.post("/apply-loan")
def apply_loan(app: LoanApplication):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT trust_score FROM users WHERE id = ?", (app.user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        score = user["trust_score"]
        eligibility = check_eligibility(score)
        
        cursor.execute(
            "INSERT INTO loans (user_id, amount, status) VALUES (?, ?, ?)",
            (app.user_id, eligibility["limit"], eligibility["status"])
        )
        conn.commit()
        
    return eligibility
