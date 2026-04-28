from fastapi import APIRouter, HTTPException
from store import users
from services.risk_detection import detect_risk, detect_fraud

router = APIRouter()

@router.get("/risk-alert/{user_id}")
def check_risk_alert(user_id: int):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from services.scoring import calculate_trust_score
    score_data = calculate_trust_score({
        "income": user.get("income", 0),
        "spending": user.get("spending", 0),
        "savings": user.get("savings", 0)
    })
    user["trust_score"] = score_data["score"]

    risk_info = detect_risk(user)
    fraud_info = detect_fraud(user)
    
    # Optional: Update user in-memory
    user["fraud"] = fraud_info
        
    return {
        "risk_level": risk_info["risk_level"],
        "risk_score": risk_info["risk_score"],
        "message": risk_info["message"],
        "fraud": {
            "detected": fraud_info["detected"],
            "type": fraud_info["type"],
            "severity": fraud_info["severity"],
            "reason": fraud_info["reason"],
            "recommendation": fraud_info["recommendation"]
        }
    }
