import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY", "")

def generate_response(message: str, user_data: dict) -> str:
    if not api_key:
        return "Please set your GEMINI_API_KEY in backend/.env to enable AI responses."

    try:
        client = genai.Client(api_key=api_key)

        context = f"""You are a helpful financial assistant for TrustFinance. Give short, actionable advice (max 2-3 sentences).

User Financial Data:
- Trust Score: {user_data.get('trust_score', 'N/A')} / 100
- Monthly Income: Rs.{user_data.get('income', 0):,}
- Monthly Spending: Rs.{user_data.get('spending', 0):,}
- Savings: Rs.{user_data.get('savings', 0):,}
- Risk Level: {user_data.get('risk_level', 'N/A')}

User: {message}"""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=context
        )
        return response.text

    except Exception as e:
        return f"I'm having trouble right now. Please try again later. ({str(e)})"
