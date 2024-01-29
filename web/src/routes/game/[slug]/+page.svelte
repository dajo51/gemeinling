<script>
	import { currentPlayerName } from '$lib/stores';
	import GameEnded from '../../../components/GameEnded.svelte';
	import { ref, onValue, update, set } from 'firebase/database';
	import { realtimeDb } from '$lib/firebase/firebase';
	import GuessingCard from '../../../components/GuessingCard.svelte';

	export let data;
	let lobbyData = {};
	let playerDescribingIndex = 0;
	let playerData = [];
	let gameId = data.gameId;

	const gameRef = ref(realtimeDb, data.gameId + '/');
	onValue(gameRef, (snapshot) => {
		lobbyData = snapshot.val();
	});

	$: playerData = lobbyData && Array.isArray(lobbyData.players) ? lobbyData.players : [];

	$: roundNumber = lobbyData && lobbyData.roundNumber ? lobbyData.roundNumber : 1;

	function getBestPlayer() {
		return Math.max(...playerData.map((player) => player.points));
	}

	function startGame() {
		update(ref(realtimeDb, data.gameId), {
			started: true
		});
		startRound();
		// console.log(getBestPlayer());
		// while (getBestPlayer() < lobbyData.maxPoints) {
		// 	startRound();
		// 	roundNumber += 1;
		// 	playerDescribingIndex = (playerDescribingIndex + 1) % playerData.length;
		// }
	}

	function startRound() {
		let playerBeingDescribedIndex;

		do {
			playerBeingDescribedIndex = Math.floor(Math.random() * playerData.length);
		} while (playerBeingDescribedIndex === playerDescribingIndex);

		set(ref(realtimeDb, data.gameId + '/rounds/' + roundNumber), {
			started: true,
			ended: false,
			playerDescribing: playerData[playerDescribingIndex].name,
			playerBeingDescribed: playerData[playerBeingDescribedIndex].name,
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

{#if lobbyData.ended === false}
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

	{#if lobbyData.started === true}
		<button on:click={startRound}>Runde starten</button>
	{/if}

	{#if lobbyData.started === true && lobbyData.rounds[roundNumber].playerDescribing === $currentPlayerName}
		<button on:click={startTurn}>Erste Eigenschaft raten</button>
	{/if}

	<GuessingCard {lobbyData} {gameId} />

	<button on:click={endGame}>Spiel beenden</button>
{:else}
	<GameEnded {playerData} />
{/if}
