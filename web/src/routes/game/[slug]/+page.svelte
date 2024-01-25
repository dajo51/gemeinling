<script>
	import { currentPlayerName } from '$lib/stores';
	import { ref, onValue, update, set } from 'firebase/database';
	import { realtimeDb } from '$lib/firebase/firebase';

	export let data;
	let lobbyData = {};
	let roundNumber = 1;
	let playerData = [];
	let characteristicsList = [];

	let currentRound = {
		started: false
	};

	const gameRef = ref(realtimeDb, data.gameId + '/');
	onValue(gameRef, (snapshot) => {
		lobbyData = snapshot.val();
	});

	$: playerData = lobbyData && Array.isArray(lobbyData.players) ? lobbyData.players : [];

	$: characteristicsList =
		lobbyData && Array.isArray(lobbyData.characteristics) ? lobbyData.characteristics : [];

	function startGame() {
		update(ref(realtimeDb, data.gameId), {
			started: true
		});
		set(ref(realtimeDb, data.gameId + '/rounds/' + roundNumber), {
			started: true
		});

		startRound();
	}

	function startRound() {
		set(ref(realtimeDb, data.gameId + '/rounds/' + roundNumber), { ...currentRound });
	}

	function endGame() {
		update(ref(realtimeDb, data.gameId), {
			ended: true
		});
	}

	console.log(lobbyData.players);
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
{#if lobbyData.started === false}
	<button on:click={startGame}>Spiel starten</button>
{/if}
