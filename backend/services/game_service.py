from models.game import Game
from models.player import Player

# In-memory game instance
game = Game()

def add_player_to_game(player: Player):
    """
    Add a new player to the game.
    """
    game.players.append(player)
    return {"message": f"Player {player.name} added successfully!", "players": game.players}

def get_game_status():
    """
    Retrieve the current status of the game.
    """
    return {
        "status": game.status,
        "current_round": game.current_round,
        "active_player": game.players[game.active_player_index].name if game.players else None,
        "players": game.players,
    }


def start_game():
    """
    Start the game by setting status and initializing the first round.
    """
    if not game.players:
        return {"error": "No players added to start the game!"}
    
    game.status = "in_progress"
    game.current_round = 1
    game.active_player_index = 0
    return {"message": "Game started!", "game_status": game}
