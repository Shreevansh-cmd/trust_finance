# In-memory store for the application state

users = [
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@test.com",
    "password": "123",
    "role": "user",
    "income": 50000,
    "spending": 20000,
    "savings": 30000,
    "trust_score": 85,
    "risk_level": "low",
    "loan_status": {
        "amount": 10000,
        "purpose": "Home Renovation",
        "status": "approved",
        "due_date": "2026-05-28"
    }
  },
  {
    "id": 2,
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "admin",
    "role": "admin",
    "income": 0,
    "spending": 0,
    "savings": 0,
    "trust_score": 100,
    "risk_level": "low",
    "loan_status": None
  }
]
