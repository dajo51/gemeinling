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
    currentPhase: 1,
    roundsLeft: players.length * 2,
    currentCards: initialCards,
    points: initialPoints,
    guesses: []
  });
}

/**
 * Draw two random cards for the current phase.
 * @param {string} gameId - The ID of the game.
 */
export async function drawCards(gameId) {
  const gameRef = doc(db, 'games', gameId);
  const randomCards = [...deck]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((text, index) => ({ id: `card${index + 1}`, text, value: 0 }));

  await updateDoc(gameRef, {
    currentCards: randomCards
  });
}

/**
 * Submit the guesses from players and update the points.
 * @param {string} gameId - The ID of the game.
 * @param {Array} guesses - An array of guesses made by players.
 */
export async function submitGuesses(gameId, guesses) {
  const gameRef = doc(db, 'games', gameId);
  const gameSnapshot = await getDoc(gameRef);

  if (!gameSnapshot.exists()) {
    throw new Error('Game not found!');
  }

  const gameData = gameSnapshot.data();
  const { describingPlayer } = gameData;
  let points = [...gameData.points];

  guesses.forEach(guess => {
    if (guess.correct) {
      const player = points.find(p => p.name === guess.player);
      if (gameData.currentPhase === 1) {
        player.points += 3;
      } else if (gameData.currentPhase === 2) {
        player.points += 2;
      } else {
        player.points += 1;
      }
    }
  });

  const describer = points.find(p => p.name === describingPlayer);
  if (guesses.filter(g => g.correct).length > guesses.length / 2) {
    describer.points += 3; // Bonus for describer if more than half guess correctly
  }

  await updateDoc(gameRef, { points });
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
  const nextPhase = gameData.currentPhase + 1;

  if (nextPhase <= 3) {
    await updateDoc(gameRef, {
      currentPhase: nextPhase,
      currentCards: cards
    });
  } else {
    const players = gameData.players;
    const currentDescriberIndex = players.findIndex(
      player => player.name === gameData.describingPlayer
    );
    const nextDescriberIndex = (currentDescriberIndex + 1) % players.length;

    await updateDoc(gameRef, {
      currentPhase: 1,
      currentCards: [],
      describingPlayer: players[nextDescriberIndex].name,
      roundsLeft: gameData.roundsLeft - 1,
      guesses: [] // Reset guesses for the next round
    });

    if (gameData.roundsLeft - 1 === 0) {
      await updateDoc(gameRef, {
        state: 'finished'
      });
    }
  }
}
