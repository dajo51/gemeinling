from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application instance
app = FastAPI(
    title="Fiesling Webapp Backend",
    description="Backend service for the Fiesling web application.",
    version="0.1.0",
)

# CORS configuration for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Root endpoint to test server status
@app.get("/")
def read_root():
    """
    Root endpoint for API health check.
    """
    logger.info("Root endpoint accessed.")
    return {"message": "FastAPI backend is up and running with the latest version!"}


# Example endpoint for starting the game
@app.get("/start")
def start_game():
    """
    Endpoint to initialize the game.
    """
    logger.info("Game start endpoint accessed.")
    return {"message": "Game has been successfully started!"}
