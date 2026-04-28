def calculate_trust_score(data: dict):
    income = data.get("income", 0)
    spending = data.get("spending", 0)
    savings = data.get("savings", 0)
    
    score = 80
    reasons = []
    
    if income > 0:
        spending_ratio = spending / income
        if spending_ratio > 1:
            score = 20
            reasons.append("Critical: Spending exceeds income.")
        elif spending_ratio > 0.7:
            score = 40
            reasons.append("Warning: High spending ratio (>70%).")
        elif spending_ratio > 0.5:
            score = 60
            reasons.append("Notice: Moderate spending ratio.")
        else:
            score = 85
            reasons.append("Excellent: Responsible spending ratio.")
    else:
        score = 20
        reasons.append("Critical: No income reported.")

    if savings < 0:
        score -= 20
        reasons.append("Warning: Negative savings reduces trust score further.")
    elif savings > 10000:
        score += 10
        reasons.append("Positive: Healthy savings buffer.")

    score = max(0, min(100, int(score)))

    suggestions = []
    if score < 70:
        suggestions.append("Consider reducing unnecessary spending.")
        if savings < 5000:
            suggestions.append("Try to increase your savings buffer.")
            
    return {"score": score, "reasons": reasons, "suggestions": suggestions}
