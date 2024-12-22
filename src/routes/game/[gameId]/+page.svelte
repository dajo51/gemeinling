<script>
    import { onMount } from 'svelte';
    import { db, joinGame, startGame, passTurn } from '$lib/firebase';
    import { doc, onSnapshot } from 'firebase/firestore';
  
    export let data;
    let gameId = data.gameId;
    let gameData = null;
    let playerName = '';
    let hasJoined = false;
    let isHost = false; // Track if the current player is the host
  
    onMount(() => {
      const gameRef = doc(db, 'games', gameId);
      const unsubscribe = onSnapshot(gameRef, (snapshot) => {
        if (snapshot.exists()) {
          gameData = snapshot.data();
  
          // Check if the current player has already joined
          hasJoined = gameData.players.some(player => player.name === playerName);
  
          // Check if the current player is the host
          if (gameData.players[0]?.name === playerName) {
            isHost = true;
          }
        } else {
          alert('Game not found!');
        }
      });
  
      return unsubscribe;
    });
  
    // Handle player joining the lobby
    async function handleJoinLobby() {
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
  
    // Handle starting the game
    async function handleStartGame() {
      try {
        await startGame(gameId);
      } catch (error) {
        console.error('Error starting game:', error);
        alert('Failed to start the game');
      }
    }

    async function handleTakeAction() {
    try {
      // Get the current list of players and current turn from gameData
      const players = gameData.players;
      const currentPlayer = gameData.currentTurn;

      // Call passTurn to move to the next player's turn
      await passTurn(gameId, players, currentPlayer);
    } catch (error) {
      console.error('Error taking action:', error);
      alert('Failed to take your turn.');
    }
  }
  </script>
  
  {#if !hasJoined}
    <h1>Enter your name to join the lobby</h1>
    <input bind:value={playerName} placeholder="Your Name" />
    <button on:click={handleJoinLobby}>Join Lobby</button>
  {:else if gameData.state === 'lobby'}
    <h1>Game Lobby: {gameId}</h1>
    <h2>Players:</h2>
    <ul>
      {#each gameData.players as player}
        <li>{player.name}</li>
      {/each}
    </ul>
  
    <!-- Only show the Start Game button for the host -->
    {#if isHost}
      <button on:click={handleStartGame}>Start Game</button>
    {:else}
      <p>Waiting for the host to start the game...</p>
    {/if}
  {:else if gameData.state === 'playing'}
    <h1>The game has started!</h1>
    <p>It's {gameData.currentTurn}'s turn!</p>
  
    {#if gameData.currentTurn === playerName}
      <button on:click={handleTakeAction}>Take Your Turn</button>
    {:else}
      <p>Waiting for {gameData.currentTurn}...</p>
    {/if}
  {:else if gameData.state === 'finished'}
    <h1>The game is over!</h1>
  {/if}
  