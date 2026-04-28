def check_eligibility(score: int):
    if score > 70:
        return {"status": "approved", "limit": 50000}
    elif 50 <= score <= 70:
        return {"status": "conditional", "limit": 20000}
    else:
        return {"status": "rejected", "limit": 0}
