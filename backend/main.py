from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import players, game
from db.database import engine
from models.player import Base

Base.metadata.create_all(bind=engine)

# Initialize app
app = FastAPI(
    title="Fiesling Webapp Backend",
    description="Backend for the Fiesling game",
    version="0.1.0",
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(players.router, prefix="/api/players", tags=["Players"])
app.include_router(game.router, prefix="/api/game", tags=["Game"])

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Fiesling Webapp API"}
