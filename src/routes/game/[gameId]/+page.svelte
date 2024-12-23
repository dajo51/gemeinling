<script>
    import { onMount } from 'svelte';
    import { db, createGame, joinGame, initializeGame, drawCards, submitPhase, submitGuesses } from '$lib/firebase';
    import { doc, onSnapshot } from 'firebase/firestore';
  
    export let data;
    let gameId = data.gameId;
    let gameData = null;
    let playerName = '';
    let hasJoined = false;
    let isHost = false;
    let cardValues = {};
    let currentGuess = '';
  
    // Firestore listener
    onMount(() => {
      const gameRef = doc(db, 'games', gameId);
      const unsubscribe = onSnapshot(gameRef, (snapshot) => {
        if (snapshot.exists()) {
          gameData = snapshot.data();
          hasJoined = gameData.players.some(player => player.name === playerName);
          if (gameData.players[0]?.name === playerName) {
            isHost = true;
          }
        } else {
          alert('Game not found!');
        }
      });
  
      return unsubscribe;
    });
  
    // Create a new game
    async function handleCreateGame() {
      if (!gameId) {
        alert('Please enter a game ID');
        return;
      }
      try {
        await createGame(gameId);
        alert('Game created successfully!');
      } catch (error) {
        console.error('Error creating game:', error);
        alert('Failed to create the game.');
      }
    }
  
    // Join the game
    async function handleJoinGame() {
      if (!playerName) {
        alert('Please enter your name');
        return;
      }
      try {
        await joinGame(gameId, playerName);
      } catch (error) {
        console.error('Error joining game:', error);
        alert(error.message);
      }
    }
  
    // Start the game
    async function handleStartGame() {
      try {
        await initializeGame(gameId);
      } catch (error) {
        console.error('Error starting game:', error);
        alert('Failed to start the game.');
      }
    }
  
    // Submit the description
    async function handleSubmitDescription() {
      try {
        const updatedCards = gameData.currentCards.map(card => ({
          ...card,
          value: cardValues[card.id] || 0
        }));
        await submitPhase(gameId, updatedCards);
      } catch (error) {
        console.error('Error submitting description:', error);
        alert('Failed to submit description.');
      }
    }
  
    // Submit a guess
    async function handleSubmitGuess() {
      try {
        await submitGuesses(gameId, [
          { player: playerName, guess: currentGuess, correct: currentGuess === gameData.describingPlayer }
        ]);
      } catch (error) {
        console.error('Error submitting guess:', error);
        alert('Failed to submit guess.');
      }
    }
  
    // Update card values
    function updateCardValue(cardId, value) {
      cardValues[cardId] = value;
    }
  </script>
  
  <!-- UI for the game -->
  {#if !hasJoined}
    <h1>Enter your name to join the lobby</h1>
    <input bind:value={playerName} placeholder="Your Name" />
    <button on:click={handleJoinGame}>Join Game</button>
  {:else if gameData.state === 'lobby'}
    <h1>Game Lobby</h1>
    <h2>Players:</h2>
    <ul>
      {#each gameData.players as player}
        <li>{player.name}</li>
      {/each}
    </ul>
  
    {#if isHost}
      <button on:click={handleStartGame}>Start Game</button>
    {:else}
      <p>Waiting for the host to start the game...</p>
    {/if}
  {:else if gameData.state === 'playing'}
    <h1>Describing Player: {gameData.describingPlayer}</h1>
  
    {#if gameData.describingPlayer === playerName}
      <h2>Describe Player: {gameData.playerToDescribe}</h2>
      {#if gameData.currentCards && gameData.currentCards.length > 0}
        {#each gameData.currentCards as card}
          <div>
            <p>{card.text}</p>
            <input
              type="range"
              min="1"
              max="5"
              value={cardValues[card.id] || card.value}
              on:input={(e) => updateCardValue(card.id, parseInt(e.target.value))}
            />
            <p>Value: {cardValues[card.id] || card.value}</p>
          </div>
        {/each}
        <button on:click={handleSubmitDescription}>Submit Description</button>
      {:else}
        <p>Waiting for cards...</p>
      {/if}
    {:else}
      <h2>Current Round</h2>
      <p>Player being described: {gameData.playerToDescribe}</p>
      {#if gameData.currentCards && gameData.currentCards.length > 0}
        <div>
          {#each gameData.currentCards as card}
            <p>{card.text}: {card.value}</p>
          {/each}
        </div>
      {/if}
    {/if}
  {:else if gameData.state === 'finished'}
    <h1>The Game is Over!</h1>
    <h2>Final Scores:</h2>
    <ul>
      {#each gameData.points as playerPoints}
        <li>{playerPoints.name}: {playerPoints.points} points</li>
      {/each}
    </ul>
  {/if}