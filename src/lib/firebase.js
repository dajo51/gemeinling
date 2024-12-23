import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const deck = [
  "freundlich",
  "diszipliniert",
  "kreativ",
  "chaotisch",
  "hilfsbereit",
  "stur",
  "ruhig",
  "gesprächig",
  "ehrgeizig",
  "faul",
  "entspannt",
  "aufmerksam"
];

/**
 * Creates a new game in Firestore.
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
 * Joins a player to an existing game.
 * @param {string} gameId - The ID of the game to join.
 * @param {string} playerName - The name of the joining player.
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
 * Initialize the game by selecting the first describing player and setting the state.
 * @param {string} gameId - The ID of the game.
 */
export async function initializeGame(gameId) {
  const gameRef = doc(db, 'games', gameId);
  const gameSnapshot = await getDoc(gameRef);

  if (!gameSnapshot.exists()) {
    throw new Error('Game not found!');
  }

  const gameData = gameSnapshot.data();
  const players = gameData.players;

  if (players.length < 2) {
    throw new Error('Need at least 2 players to start!');
  }

  // Select random describing player
  const randomDescribingIndex = Math.floor(Math.random() * players.length);
  const describingPlayer = players[randomDescribingIndex].name;

  // Select random player to be described (different from describing player)
  let randomTargetIndex;
  do {
    randomTargetIndex = Math.floor(Math.random() * players.length);
  } while (randomTargetIndex === randomDescribingIndex);
  const playerToDescribe = players[randomTargetIndex].name;

  const initialPoints = players.map(player => ({
    name: player.name,
    points: 0
  }));

  // Draw initial cards
  const initialCards = [...deck]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((text, index) => ({ id: `card${index + 1}`, text, value: 0 }));

  await updateDoc(gameRef, {
    state: 'playing',
    describingPlayer,
    playerToDescribe,
    currentRound: 1,
    currentPhase: 'describing', // phases: describing -> guessing -> next round
    roundsLeft: 3,
    currentCards: initialCards,
    points: initialPoints,
    guesses: {},  // Store guesses as {playerName: {guess: string, roundFirstGuessed: number}}
    revealedCards: [], // Store all cards that have been revealed so far
    waitingForGuesses: true
  });
}

/**
 * Submit the current phase description and handle phase progression.
 * @param {string} gameId - The ID of the game.
 * @param {Array} cards - The updated cards with their values.
 */
export async function submitPhase(gameId, cards) {
  const gameRef = doc(db, 'games', gameId);
  const gameSnapshot = await getDoc(gameRef);

  if (!gameSnapshot.exists()) {
    throw new Error('Game not found!');
  }

  const gameData = gameSnapshot.data();
  const updatedRevealedCards = [...(gameData.revealedCards || []), ...cards];

  await updateDoc(gameRef, {
    currentCards: cards,
    revealedCards: updatedRevealedCards,
    currentPhase: 'guessing',
    waitingForGuesses: true
  });

  // Draw new cards if not the last round
  if (gameData.currentRound < 3) {
    const newCards = [...deck]
      .filter(card => !updatedRevealedCards.some(rc => rc.text === card))
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((text, index) => ({ id: `card${index + 1}`, text, value: 0 }));

    await updateDoc(gameRef, {
      nextCards: newCards
    });
  }
}

/**
 * Submit a guess from a player
 * @param {string} gameId - The ID of the game.
 * @param {string} playerName - The name of the guessing player.
 * @param {string} guess - The player's guess.
 */
export async function submitGuess(gameId, playerName, guess) {
  const gameRef = doc(db, 'games', gameId);
  const gameSnapshot = await getDoc(gameRef);

  if (!gameSnapshot.exists()) {
    throw new Error('Game not found!');
  }

  const gameData = gameSnapshot.data();
  const guesses = { ...gameData.guesses };
  const currentRound = gameData.currentRound;

  // Update or create the player's guess
  if (!guesses[playerName]) {
    guesses[playerName] = {
      guess,
      roundFirstGuessed: currentRound,
      lastUpdatedRound: currentRound
    };
  } else {
    guesses[playerName] = {
      ...guesses[playerName],
      guess,
      lastUpdatedRound: currentRound,
      changed: guesses[playerName].guess !== guess
    };
  }

  // Check if all non-describing players have submitted guesses for the current round
  const nonDescribingPlayers = gameData.players.filter(p => p.name !== gameData.describingPlayer);
  const allGuessesSubmitted = nonDescribingPlayers.every(p => 
    guesses[p.name]?.lastUpdatedRound === currentRound
  );

  await updateDoc(gameRef, {
    guesses,
    waitingForGuesses: !allGuessesSubmitted
  });

  // If all guesses are in, proceed to next round or end game
  if (allGuessesSubmitted) {
    if (currentRound === 3) {
      // Calculate final scores
      const points = calculateFinalPoints(gameData.points, guesses, gameData.playerToDescribe);
      await updateDoc(gameRef, {
        state: 'finished',
        points
      });
    } else {
      // Start next round
      await updateDoc(gameRef, {
        currentRound: currentRound + 1,
        currentPhase: 'describing',
        currentCards: gameData.nextCards || [],
        nextCards: []
      });
    }
  }
}

function calculateFinalPoints(currentPoints, guesses, correctPlayer) {
  const points = [...currentPoints];
  
  Object.entries(guesses).forEach(([playerName, guessData]) => {
    if (guessData.guess === correctPlayer) {
      const playerPoints = points.find(p => p.name === playerName);
      if (playerPoints) {
        // Award points based on when they first guessed correctly and if they changed their guess
        if (guessData.roundFirstGuessed === 1 && !guessData.changed) {
          playerPoints.points += 3;
        } else if (guessData.roundFirstGuessed === 2 || (guessData.roundFirstGuessed === 1 && guessData.changed)) {
          playerPoints.points += 2;
        } else {
          playerPoints.points += 1;
        }
      }
    }
  });

  return points;
}
