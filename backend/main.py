import sys
import os

# Ensure the backend directory is always on the path regardless of where
# uvicorn is invoked from (e.g. `uvicorn backend.main:app` from the project root)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import init_db
from routes import user, loan, risk, admin

app = FastAPI(title="Dynamic Trust-Based Loan Ecosystem")

# Enable CORS for all origins (frontend on any port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(loan.router, prefix="/api", tags=["Loan"])
app.include_router(risk.router, prefix="/api", tags=["Risk"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def read_root():
    return {"message": "TrustLend API is running"}
