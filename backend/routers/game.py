from fastapi import APIRouter
from models.player import Player
from services.game_service import add_player_to_game, get_game_status, start_game

router = APIRouter()

@router.post("/add_player")
def add_player(player: Player):
    """
    Add a player to the game.
    """
    return add_player_to_game(player)

@router.get("/status")
def get_game_status_endpoint():
    """
    Endpoint to retrieve the current game status.
    """
    return get_game_status()


@router.post("/start")
def start_game_endpoint():
    """
    Endpoint to start the game.
    """
    return start_game()