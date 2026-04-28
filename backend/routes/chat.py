from fastapi import APIRouter
from pydantic import BaseModel
from services.chatbot import generate_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_data: dict

@router.post("/chat")
def chat_endpoint(req: ChatRequest):
    reply = generate_response(req.message, req.user_data)
    return {"reply": reply}
