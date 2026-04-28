from fastapi import APIRouter, HTTPException
from store import users
from services.risk_detection import detect_risk_change

router = APIRouter()

@router.get("/risk-alert/{user_id}")
def check_risk_alert(user_id: int, prev_income: int, prev_spending: int, curr_income: int, curr_spending: int):
    risk_info = detect_risk_change(
        {"income": prev_income, "spending": prev_spending},
        {"income": curr_income, "spending": curr_spending}
    )
    
    user = next((u for u in users if u["id"] == user_id), None)
    if user:
        user["risk_level"] = risk_info["level"]
        
    return {
        "risk_change": risk_info["risk_percent"],
        "risk_level": risk_info["level"],
        "message": risk_info["alerts"]
    }
