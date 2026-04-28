from fastapi import APIRouter
from store import users

router = APIRouter()

@router.get("/admin/users")
def get_users():
    from services.risk_detection import detect_risk, detect_fraud
    from services.scoring import calculate_trust_score
    
    updated_users = []
    for u in users:
        score_data = calculate_trust_score({
            "income": u.get("income", 0),
            "spending": u.get("spending", 0),
            "savings": u.get("savings", 0)
        })
        u["trust_score"] = score_data["score"]
        
        risk_info = detect_risk(u)
        fraud_info = detect_fraud(u)
        u["risk_level"] = risk_info["risk_level"]
        u["fraud"] = fraud_info
        updated_users.append(u)
        
    return {"users": updated_users}
