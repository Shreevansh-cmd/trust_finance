from fastapi import APIRouter
from store import users

router = APIRouter()

@router.get("/admin/users")
def get_users():
    return {"users": users}
