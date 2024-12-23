<script>
    import { onMount } from 'svelte';
    import { db, createGame, joinGame, initializeGame, submitPhase, submitGuess } from '$lib/firebase';
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
  
    async function handleSubmitGuess() {
      if (!currentGuess) {
        alert('Please select a player');
        return;
      }
      try {
        await submitGuess(gameId, playerName, currentGuess);
      } catch (error) {
        console.error('Error submitting guess:', error);
        alert('Failed to submit guess.');
      }
    }
  
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
    <h1>Round {gameData.currentRound} of 3</h1>
    
    {#if gameData.describingPlayer === playerName}
      {#if gameData.currentPhase === 'describing'}
        <h2>You are describing: {gameData.playerToDescribe}</h2>
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
        {/if}
      {:else}
        <h2>Waiting for players to make their guesses...</h2>
        <div>
          <h3>Previously Described Traits:</h3>
          {#each gameData.revealedCards as card}
            <p>{card.text}: {card.value}</p>
          {/each}
        </div>
      {/if}
    {:else}
      {#if gameData.currentPhase === 'describing'}
        <h2>Waiting for {gameData.describingPlayer} to describe...</h2>
      {:else}
        <h2>Make Your Guess</h2>
        {#if gameData.revealedCards && gameData.revealedCards.length > 0}
          <div>
            <h3>Current Traits:</h3>
            {#each gameData.revealedCards as card}
              <p>{card.text}: {card.value}</p>
            {/each}
          </div>
        {/if}
        
        {#if !gameData.guesses[playerName] || gameData.currentRound > gameData.guesses[playerName].roundFirstGuessed}
          <select bind:value={currentGuess}>
            <option value="">Select a player</option>
            {#each gameData.players.filter(p => p.name !== gameData.describingPlayer) as player}
              <option value={player.name}>{player.name}</option>
            {/each}
          </select>
          <button on:click={handleSubmitGuess}>Submit Guess</button>
        {:else}
          <p>Your current guess: {gameData.guesses[playerName].guess}</p>
          <button on:click={() => currentGuess = ''}>Change Guess</button>
        {/if}
      {/if}
    {/if}
  {:else if gameData.state === 'finished'}
    <h1>Game Over!</h1>
    <h2>Final Scores:</h2>
    <ul>
      {#each gameData.points as playerPoints}
        <li>{playerPoints.name}: {playerPoints.points} points</li>
      {/each}
    </ul>
    
    <h3>The player being described was: {gameData.playerToDescribe}</h3>
  {/if}