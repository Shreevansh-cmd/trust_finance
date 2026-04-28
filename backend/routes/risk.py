from fastapi import APIRouter
from pydantic import BaseModel
from database.db import get_db
from services.risk_detection import detect_risk_change
from services.scoring import calculate_trust_score

router = APIRouter()

class RiskData(BaseModel):
    user_id: int
    prev_data: dict
    curr_data: dict

@router.post("/risk-alert")
def check_risk_alert(data: RiskData):
    risk_info = detect_risk_change(data.prev_data, data.curr_data)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET risk_level = ? WHERE id = ?", (risk_info["level"], data.user_id))
        
        # update the actual score too? For now just risk level
        conn.commit()
        
    return risk_info
