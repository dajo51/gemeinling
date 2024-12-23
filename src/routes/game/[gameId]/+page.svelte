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
  
  <div>
    {#if !hasJoined}
      <h1>Enter your name to join the lobby</h1>
      <input bind:value={playerName} placeholder="Your Name" />
      <button on:click={handleJoinGame}>Join Game</button>
    {:else}
      <div>
        <div>
          <h3>Current Scores:</h3>
          {#if gameData?.points && gameData.state !== 'finished'}
            <ul>
              {#each gameData.points.sort((a, b) => b.points - a.points) as player}
                <li>{player.name}: {player.points} points</li>
              {/each}
            </ul>
          {/if}
        </div>

        <div>
          <p><strong>You are playing as: {playerName}</strong></p>

          {#if gameData.state === 'lobby'}
            <h2>Game Lobby</h2>
            <h3>Players:</h3>
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
              {/if}
            {:else}
              {#if gameData.currentPhase === 'guessing'}
                <div>
                  {#if gameData.revealedCards && gameData.revealedCards.length > 0}
                    <div>
                      <h3>Traits described:</h3>
                      <div>
                        <h4>First two traits:</h4>
                        <ul>
                          {#each gameData.revealedCards.slice(0, 2) as card}
                            <li>
                              <strong>{card.text}:</strong> {card.value}
                            </li>
                          {/each}
                        </ul>
                      </div>

                      {#if gameData.revealedCards.length > 2}
                        <div>
                          <h4>Second two traits:</h4>
                          <ul>
                            {#each gameData.revealedCards.slice(2, 4) as card}
                              <li>
                                <strong>{card.text}:</strong> {card.value}
                              </li>
                            {/each}
                          </ul>
                        </div>
                      {/if}

                      {#if gameData.revealedCards.length > 4}
                        <div>
                          <h4>Final two traits:</h4>
                          <ul>
                            {#each gameData.revealedCards.slice(4, 6) as card}
                              <li>
                                <strong>{card.text}:</strong> {card.value}
                              </li>
                            {/each}
                          </ul>
                        </div>
                      {/if}
                    </div>
                  {/if}

                  {#if guessSubmitted}
                    <div>
                      <p>✓ Your guess has been submitted for round {gameData.currentRound}</p>
                      <p>Waiting for other players to submit their guesses...</p>
                    </div>
                  {:else}
                    {#if gameData.guesses[playerName]}
                      <div>
                        <h3>Your current guess: {gameData.guesses[playerName].guess}</h3>
                        {#if gameData.currentRound > 1}
                          <p>Do you want to:</p>
                          <div>
                            <button on:click={handleKeepGuess}>
                              Keep guessing {gameData.guesses[playerName].guess}
                            </button>
                            <p>or</p>
                            <button on:click={() => showChangeGuess = true}>
                              Change your guess
                            </button>
                          </div>
                        {/if}
                      </div>
                    {/if}

                    {#if !gameData.guesses[playerName] || showChangeGuess}
                      <div>
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
            <h2>Game Over!</h2>
            <h3>Winner: {gameData.winner}!</h3>
            <h4>Final Scores:</h4>
            <ul>
              {#each gameData.points.sort((a, b) => b.points - a.points) as playerPoints}
                <li>{playerPoints.name}: {playerPoints.points} points</li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    {/if}
  </div>