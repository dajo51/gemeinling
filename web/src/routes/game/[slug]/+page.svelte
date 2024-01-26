<script>
	import { currentPlayerName } from '$lib/stores';
	import { ref, onValue, update, set } from 'firebase/database';
	import { realtimeDb } from '$lib/firebase/firebase';

	export let data;
	let lobbyData = {};
	let roundNumber = 1;
	let playerDescribingIndex = 0;
	let playerData = [];

	const gameRef = ref(realtimeDb, data.gameId + '/');
	onValue(gameRef, (snapshot) => {
		lobbyData = snapshot.val();
	});

	$: playerData = lobbyData && Array.isArray(lobbyData.players) ? lobbyData.players : [];

	function getBestPlayer() {
		return Math.max(...playerData.map((player) => player.points));
	}

	function startGame() {
		update(ref(realtimeDb, data.gameId), {
			started: true
		});
		console.log(getBestPlayer());
		while (getBestPlayer() < lobbyData.maxPoints) {
			startRound();
			roundNumber += 1;
			playerDescribingIndex = (playerDescribingIndex + 1) % playerData.length;
		}
	}

	function startRound() {
		set(ref(realtimeDb, data.gameId + '/rounds/' + roundNumber), {
			started: true,
			ended: false,
			playerDescribing: playerData[playerDescribingIndex].name,
			playerBeingDescribed: playerData[Math.floor(Math.random() * playerData.length)].name,
			turns: []
		});
	}

	function startTurn() {
		set(ref(realtimeDb, data.gameId + '/rounds/turns/' + turnNumber), {
			started: true,
			ended: false,
			characteristics: {}
		});
	}

	function endGame() {
		update(ref(realtimeDb, data.gameId), {
			ended: true
		});
	}
</script>

<h1 class="text-2xl">Spiel ID: {data.gameId}</h1>
<h2 class="text-xl">Du bist: {$currentPlayerName}</h2>

<ul class="list">
	{#each playerData as player}
		<li class="m-2">
			{player.name} hat {player.points}
			{player.points === 1 ? 'Punkt' : 'Punkte'}
		</li>
	{/each}
</ul>
{#if lobbyData.started === true}
	<button on:click={startGame}>Spiel starten</button>
{/if}
