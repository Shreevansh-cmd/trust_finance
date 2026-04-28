def detect_risk_change(prev_data: dict, curr_data: dict):
    # detect income drop, spending spike
    prev_income = prev_data.get("income", 0)
    curr_income = curr_data.get("income", 0)
    prev_spending = prev_data.get("spending", 0)
    curr_spending = curr_data.get("spending", 0)
    
    risk_percent = 0
    alerts = []
    
    if prev_income > 0 and curr_income < prev_income:
        drop = (prev_income - curr_income) / prev_income
        if drop > 0.2:
            risk_percent += int(drop * 100)
            alerts.append(f"Income dropped by {int(drop*100)}%")
            
    if prev_spending > 0 and curr_spending > prev_spending:
        spike = (curr_spending - prev_spending) / prev_spending
        if spike > 0.3:
            risk_percent += int(spike * 100)
            alerts.append(f"Spending spiked by {int(spike*100)}%")
            
    level = "low"
    if risk_percent >= 50:
        level = "high"
    elif risk_percent >= 20:
        level = "medium"
        
    return {"risk_percent": risk_percent, "level": level, "alerts": alerts}
