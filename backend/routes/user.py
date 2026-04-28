from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from store import users
from services.scoring import calculate_trust_score

router = APIRouter()

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

class UpdateScore(BaseModel):
    income: int
    spending: int
    savings: int

class ApplyLoan(BaseModel):
    amount: int
    purpose: str

@router.post("/login")
def login(login_data: UserLogin):
    user = next((u for u in users if u["email"] == login_data.email and u["password"] == login_data.password and u["role"] == login_data.role), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Simple token generation
    token = f"token_{user['id']}"
    return {"user_id": user["id"], "role": user["role"], "token": token}

@router.get("/dashboard/{user_id}")
def get_dashboard(user_id: int):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    score_data = calculate_trust_score({
        "income": user["income"],
        "spending": user["spending"],
        "savings": user["savings"]
    })
    
    from services.risk_detection import detect_risk, detect_fraud
    
    risk_info = detect_risk(user)
    fraud_info = detect_fraud(user)
    
    # Update score in memory
    user["trust_score"] = score_data["score"]
    user["risk_level"] = risk_info["risk_level"]
    user["fraud"] = fraud_info
        
    return {
        "user_id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "trust_score": user["trust_score"],
        "risk_level": user["risk_level"],
        "risk_score": risk_info["risk_score"],
        "risk_message": risk_info["message"],
        "fraud": {
            "detected": fraud_info["detected"],
            "type": fraud_info["type"],
            "severity": fraud_info["severity"],
            "reason": fraud_info["reason"],
            "recommendation": fraud_info["recommendation"]
        },
        "loan_limit": user["income"] * 3,
        "financial_summary": {
            "income": user["income"],
            "spending": user["spending"],
            "savings": user["savings"],
        },
        "loan_status": user.get("loan_status"),
        "explanation": {
            "reasons": score_data["reasons"],
            "suggestions": score_data["suggestions"]
        },
        "history": user.get("history", [])
    }

@router.post("/update-financials/{user_id}")
def update_financials(user_id: int, data: UpdateScore):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # calculate new score
    score_res = calculate_trust_score(data.model_dump())
    new_score = score_res["score"]
    
    user["income"] = data.income
    user["spending"] = data.spending
    user["savings"] = data.savings
    user["trust_score"] = new_score
    
    if "history" not in user:
        user["history"] = []
    
    # Just append a generic month like "Next" for simplicity in demo
    user["history"].append({
        "month": "Simulated",
        "income": data.income,
        "spending": data.spending,
        "savings": data.savings,
        "trust_score": new_score
    })
        
    return score_res

@router.post("/reset-financials/{user_id}")
def reset_financials(user_id: int):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user["income"] = 50000
    user["spending"] = 20000
    user["savings"] = 30000
    user["trust_score"] = 85
    user["risk_level"] = "low"
    user["fraud"] = {
        "detected": False,
        "type": "None",
        "severity": "Low",
        "reason": "No suspicious activity detected.",
        "recommendation": "None"
    }
    user["history"] = [
        {"month": "Jan", "income": 48000, "spending": 19000, "savings": 25000, "trust_score": 80},
        {"month": "Feb", "income": 48000, "spending": 22000, "savings": 26000, "trust_score": 78},
        {"month": "Mar", "income": 50000, "spending": 21000, "savings": 28000, "trust_score": 82},
        {"month": "Apr", "income": 50000, "spending": 20000, "savings": 30000, "trust_score": 85}
    ]
    return {"message": "Reset successful"}

@router.post("/apply-loan/{user_id}")
def apply_loan(user_id: int, loan_data: ApplyLoan):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user["trust_score"] < 50:
        raise HTTPException(status_code=400, detail="Trust score too low for a loan")
        
    limit = user["income"] * 3
    if loan_data.amount > limit:
        raise HTTPException(status_code=400, detail="Requested amount exceeds loan limit")
        
    user["loan_status"] = {
        "amount": loan_data.amount,
        "purpose": loan_data.purpose,
        "status": "pending",
        "due_date": "2027-01-01"
    }
    
    return {"message": "Loan applied successfully", "loan_status": user["loan_status"]}

