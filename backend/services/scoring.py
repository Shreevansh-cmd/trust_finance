def calculate_trust_score(data: dict):
    # input: income, spending, savings
    income = data.get("income", 0)
    spending = data.get("spending", 0)
    savings = data.get("savings", 0)
    
    score = 50 # Base score
    reasons = []
    
    if income > 5000:
        score += 20
        reasons.append("High income adds to stability.")
    elif income < 2000:
        score -= 10
        reasons.append("Low income presents repayment risk.")
        
    if savings > 10000:
        score += 20
        reasons.append("Healthy savings buffer.")
        
    if spending > income:
        score -= 30
        reasons.append("Warning: Spending exceeds income.")
    elif spending < (income * 0.5):
        score += 10
        reasons.append("Responsible spending habits.")
        
    score = max(0, min(100, score))
    
    suggestions = []
    if score < 70:
        suggestions.append("Consider reducing unnecessary spending.")
        if savings < 5000:
            suggestions.append("Try to increase your savings buffer.")
            
    return {"score": score, "reasons": reasons, "suggestions": suggestions}
