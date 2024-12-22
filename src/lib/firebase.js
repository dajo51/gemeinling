// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

// Firebase configuration (pulled from environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// Set up Firestore and export it
export const db = getFirestore(app);

/**
 * Creates a new game in the Firestore database.
 * @param {string} gameId - The ID of the new game.
 */
export async function createGame(gameId) {
  const gameRef = doc(collection(db, 'games'), gameId);
  await setDoc(gameRef, {
    state: 'lobby',
    players: [],
    createdAt: new Date().toISOString()
  });
}

/**
 * Joins an existing game by adding a player to the players list.
 * @param {string} gameId - The ID of the game to join.
 * @param {string} playerName - The name of the player joining the game.
 */
export async function joinGame(gameId, playerName) {
  const gameRef = doc(db, 'games', gameId);
  const gameSnapshot = await getDoc(gameRef);

  if (!gameSnapshot.exists()) {
    throw new Error('Game does not exist!');
  }

  await updateDoc(gameRef, {
    players: arrayUnion({ id: Date.now().toString(), name: playerName })
  });
}

/**
 * Start the game and set a random player's turn.
 * @param {string} gameId - The ID of the game.
 */
export async function startGame(gameId) {
    const gameRef = doc(db, 'games', gameId);
    const gameSnapshot = await getDoc(gameRef);
  
    if (!gameSnapshot.exists()) {
      throw new Error('Game not found!');
    }
  
    const gameData = gameSnapshot.data();
    const players = gameData.players;
  
    if (players.length === 0) {
      throw new Error('No players in the game!');
    }
  
    // Select a random player to start
    const randomPlayerIndex = Math.floor(Math.random() * players.length);
    const randomPlayer = players[randomPlayerIndex].name;
  
    // Update Firestore with the initial turn and new state
    await updateDoc(gameRef, {
      currentTurn: randomPlayer, // Set a random player as the first turn
      state: 'playing'
    });
  }

/**
 * Pass the turn to the next player.
 * @param {string} gameId - The ID of the game.
 * @param {Array} players - List of players.
 * @param {string} currentPlayer - Name of the current player.
 */
export async function passTurn(gameId, players, currentPlayer) {
    const gameRef = doc(db, 'games', gameId);
  
    // Find the index of the current player and calculate the next turn
    const currentIndex = players.findIndex(player => player.name === currentPlayer);
    const nextIndex = (currentIndex + 1) % players.length; // Cycle through players
  
    await updateDoc(gameRef, {
      currentTurn: players[nextIndex].name
    });
  }