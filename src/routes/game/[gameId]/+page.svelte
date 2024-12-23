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
    let showChangeGuess = false;
    let guessSubmitted = false;
  
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
  
    $: {
      if (gameData?.currentRound) {
        // Reset guessSubmitted when round changes
        guessSubmitted = gameData.guesses[playerName]?.lastUpdatedRound === gameData.currentRound;
      }
    }

    async function handleKeepGuess() {
      try {
        const currentGuessData = gameData.guesses[playerName];
        await submitGuess(gameId, playerName, currentGuessData.guess);
        guessSubmitted = true;
      } catch (error) {
        console.error('Error keeping guess:', error);
        alert('Failed to keep current guess.');
      }
    }

    async function handleSubmitGuess() {
      if (!currentGuess) {
        alert('Please select a player');
        return;
      }
      try {
        await submitGuess(gameId, playerName, currentGuess);
        showChangeGuess = false;
        guessSubmitted = true;
      } catch (error) {
        console.error('Error submitting guess:', error);
        alert('Failed to submit guess.');
      }
    }

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
  
    function updateCardValue(cardId, value) {
      cardValues[cardId] = value;
    }
  </script>
  
  {#if !hasJoined}
    <h1>Enter your name to join the lobby</h1>
    <input bind:value={playerName} placeholder="Your Name" />
    <button on:click={handleJoinGame}>Join Game</button>
  {:else}
    <div class="player-info">
      <strong>You are playing as: {playerName}</strong>
    </div>
  
    {#if gameData.state === 'lobby'}
      <h1>Game Lobby</h1>
      <h2>Players:</h2>
      <ul>
        {#each gameData.players as player}
          <li>{player.name} {player.name === playerName ? '(You)' : ''}</li>
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
              <div class="card-rating">
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
        {/if}
      {:else}
        {#if gameData.currentPhase === 'guessing'}
          <div class="guess-section">
            {#if gameData.revealedCards && gameData.revealedCards.length > 0}
              <div class="revealed-cards">
                <h3>Current Traits:</h3>
                {#each gameData.revealedCards as card}
                  <div class="trait-card">
                    <p>{card.text}: {card.value}</p>
                  </div>
                {/each}
              </div>
            {/if}

            {#if guessSubmitted}
              <div class="guess-confirmation">
                <p>✓ Your guess has been submitted for round {gameData.currentRound}</p>
                <p>Waiting for other players to submit their guesses...</p>
              </div>
            {:else}
              {#if gameData.guesses[playerName]}
                <div class="current-guess">
                  <h3>Your current guess: {gameData.guesses[playerName].guess}</h3>
                  {#if gameData.currentRound > 1}
                    <p>Do you want to:</p>
                    <div class="guess-buttons">
                      <button class="keep-guess" on:click={handleKeepGuess}>
                        Keep guessing {gameData.guesses[playerName].guess}
                      </button>
                      <p>or</p>
                      <button class="change-guess" on:click={() => showChangeGuess = true}>
                        Change your guess
                      </button>
                    </div>
                  {/if}
                </div>
              {/if}

              {#if !gameData.guesses[playerName] || showChangeGuess}
                <div class="new-guess">
                  <select bind:value={currentGuess}>
                    <option value="">Select a player to guess</option>
                    {#each gameData.players.filter(p => p.name !== gameData.describingPlayer) as player}
                      <option value={player.name}>{player.name}</option>
                    {/each}
                  </select>
                  <button on:click={handleSubmitGuess}>Submit New Guess</button>
                </div>
              {/if}
            {/if}
          </div>
        {:else}
          <h2>Waiting for {gameData.describingPlayer} to describe...</h2>
        {/if}
      {/if}
    {:else if gameData.state === 'finished'}
      <h1>Game Over!</h1>
      <h2>Final Scores:</h2>
      <ul>
        {#each gameData.points as playerPoints}
          <li>{playerPoints.name} {playerPoints.name === playerName ? '(You)' : ''}: {playerPoints.points} points</li>
        {/each}
      </ul>
      
      <h3>The player being described was: {gameData.playerToDescribe}</h3>
    {/if}
  {/if}

  <style>
    .player-info {
      position: fixed;
      top: 10px;
      right: 10px;
      background: #f0f0f0;
      padding: 8px 12px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card-rating {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .revealed-cards {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .trait-card {
      margin: 10px 0;
      padding: 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .trait-card p {
      margin: 0;
      font-size: 1.1em;
    }

    .guess-section {
      margin: 20px 0;
    }

    .current-guess {
      margin-bottom: 20px;
      padding: 15px;
      background: #e8f4ff;
      border-radius: 4px;
    }

    .guess-buttons {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-top: 10px;
    }

    .keep-guess {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }

    .change-guess {
      background: #2196F3;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      opacity: 0.9;
    }

    select {
      padding: 8px;
      margin-right: 10px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .guess-confirmation {
      margin: 20px 0;
      padding: 15px;
      background: #e8ffe8;
      border: 1px solid #4CAF50;
      border-radius: 4px;
      text-align: center;
    }

    .guess-confirmation p:first-child {
      color: #4CAF50;
      font-weight: bold;
    }
  </style>