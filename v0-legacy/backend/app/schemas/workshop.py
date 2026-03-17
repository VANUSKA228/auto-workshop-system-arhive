from pydantic import BaseModel
from typing import Optional, List


class WorkshopBase(BaseModel):
    name: str
    city: str
    address: Optional[str] = None
    phone: Optional[str] = None


class WorkshopCreate(WorkshopBase):
    pass


class WorkshopUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None


class WorkshopRead(WorkshopBase):
    id: int
    model_config = {"from_attributes": True}


class WorkshopWithUsers(WorkshopRead):
    """Мастерская со списком пользователей."""
    users: List[dict] = []
    model_config = {"from_attributes": True}

