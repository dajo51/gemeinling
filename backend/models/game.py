from typing import List
from pydantic import BaseModel
from models.player import Player

class Game(BaseModel):
    players: List[Player] = []  # List of players
    current_round: int = 1      # Current round number
    active_player_index: int = 0  # Index of the active player
    status: str = "waiting"     # Game status: "waiting", "in_progress", "finished"
