from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from db.database import Base

class Player(BaseModel):
    name: str
    points: int = 0

class PlayerDB(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    points = Column(Integer, default=0)