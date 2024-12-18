from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.player import PlayerDB

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/add_player")
def add_player(name: str, db: Session = Depends(get_db)):
    """
    Add a player to the database.
    """
    db_player = db.query(PlayerDB).filter(PlayerDB.name == name).first()
    if db_player:
        return {"error": "Player already exists!"}
    
    new_player = PlayerDB(name=name, points=0)
    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    return {"message": f"Player {name} added successfully!", "player": new_player}

@router.delete("/remove_player")
def remove_player(name: str, db: Session = Depends(get_db)):
    """
    Remove a player from the database by name.
    """
    player = db.query(PlayerDB).filter(PlayerDB.name == name).first()
    if not player:
        return {"error": f"Player {name} not found."}

    db.delete(player)
    db.commit()
    return {"message": f"Player {name} has been removed."}

@router.get("/players")
def get_players(db: Session = Depends(get_db)):
    """
    Retrieve all players from the database.
    """
    return db.query(PlayerDB).all()

@router.put("/update_points")
def update_points(name: str, points: int, db: Session = Depends(get_db)):
    """
    Update the points of a player in the database.
    """
    player = db.query(PlayerDB).filter(PlayerDB.name == name).first()
    if not player:
        return {"error": f"Player {name} not found."}

    player.points += points
    db.commit()
    db.refresh(player)
    return {"message": f"Updated {name}'s points to {player.points}", "player": player}
