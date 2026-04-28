import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                trust_score INTEGER DEFAULT 50,
                risk_level TEXT DEFAULT 'low',
                income INTEGER DEFAULT 0,
                spending INTEGER DEFAULT 0,
                savings INTEGER DEFAULT 0
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS loans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                amount INTEGER,
                purpose TEXT,
                status TEXT,
                due_date TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        
        # Seed data
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO users (username, trust_score, risk_level, income, spending, savings) VALUES ('John Doe', 85, 'Low', 50000, 20000, 30000)")
            cursor.execute("INSERT INTO loans (user_id, amount, purpose, status, due_date) VALUES (1, 10000, 'Home Renovation', 'approved', '2026-05-28')")
        
        conn.commit()

@contextmanager
def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
