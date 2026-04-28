def detect_risk(user):
    income = user.get("income", 0)
    spending = user.get("spending", 0)
    savings = user.get("savings", 0)
    history = user.get("history", [])

    spending_ratio = spending / income if income > 0 else 1.0

    risk_level = "low"
    risk_score = 20
    message = "Spending is well within limits."

    if spending_ratio > 0.7:
        risk_level = "high"
        risk_score = 80
        message = "High spending ratio."
    elif spending_ratio >= 0.5:
        risk_level = "medium"
        risk_score = 50
        message = "Moderate spending ratio."

    if len(history) > 0:
        last_month = history[-1]
        prev_spending = last_month.get("spending", 0)
        prev_savings = last_month.get("savings", 0)

        if prev_spending > 0 and spending > prev_spending * 1.5:
            risk_level = "high"
            risk_score = max(risk_score, 85)
            message = "Sudden spike in spending detected."

        if prev_savings > 0 and savings < prev_savings * 0.5:
            risk_level = "high" if risk_level == "high" else "medium"
            risk_score = max(risk_score, 60)
            message = "Significant drop in savings detected."

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "message": message
    }

def detect_fraud(user, transactions=None):
    income = user.get("income", 0)
    current_spending = user.get("spending", 0)
    
    fraud = {
        "detected": False,
        "type": "None",
        "severity": "Low",
        "reason": "No suspicious activity detected.",
        "recommendation": "None"
    }

    if current_spending > 2 * income and income > 0:
        fraud.update({
            "detected": True,
            "type": "Spending Spike",
            "severity": "High",
            "reason": f"Current spending (₹{current_spending}) is more than 2x income (₹{income}).",
            "recommendation": "Immediate account freeze recommended. Call user to verify transaction."
        })
    elif current_spending > 1.2 * income and income > 0:
        fraud.update({
            "detected": True,
            "type": "Spending Spike",
            "severity": "Medium",
            "reason": f"Current spending (₹{current_spending}) is more than 1.2x income (₹{income}).",
            "recommendation": "Review recent transactions and verify with the user."
        })

    txns = transactions or user.get("transactions", [])
    if txns:
        if len(txns) > 10:
            fraud.update({
                "detected": True,
                "type": "Rapid Transactions",
                "severity": fraud["severity"] if fraud["severity"] == "High" else "Medium",
                "reason": "Multiple transactions detected in a very short time window.",
                "recommendation": "Temporarily block outgoing transactions and require 2FA for the next login."
            })
        
        for t in txns:
            if income > 0 and t.get("amount", 0) > 2 * income:
                fraud.update({
                    "detected": True,
                    "type": "Large Transaction",
                    "severity": "High",
                    "reason": f"A single transaction of ₹{t.get('amount')} exceeds 2x the income.",
                    "recommendation": "Immediate account freeze recommended."
                })

    return fraud
