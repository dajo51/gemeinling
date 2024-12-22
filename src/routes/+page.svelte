<script>
    import { createGame } from '$lib/firebase';
  
    let showJoinForm = false;
    let gameId = '';
  
    // Create a new game
    async function handleCreateGame() {
      const newGameId = Math.random().toString(36).substr(2, 8);
      await createGame(newGameId);
      window.location.href = `/game/${newGameId}`;
    }
  
    // Handle Join Game button click
    function handleShowJoinForm() {
      showJoinForm = true;
    }
  
    // Redirect to the game page
    function handleJoinGame() {
      if (!gameId) {
        alert('Please enter a Game ID');
        return;
      }
      window.location.href = `/game/${gameId}`;
    }
  </script>
  
  <h1>Welcome to Fiesling</h1>
  
  <!-- Create Game Button -->
  <button on:click={handleCreateGame}>Create Game</button>
  
  <!-- Join Game Button -->
  {#if !showJoinForm}
    <button on:click={handleShowJoinForm}>Join Game</button>
  {:else}
    <div>
      <input bind:value={gameId} placeholder="Enter Game ID" />
      <button on:click={handleJoinGame}>Join</button>
    </div>
  {/if}
  