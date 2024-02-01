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

	$: roundNumber = lobbyData && lobbyData.roundNumber ? lobbyData.roundNumber : null;

	$: currentRound =
		lobbyData && lobbyData.rounds && roundNumber ? lobbyData.rounds[roundNumber] : null;

	$: turnNumber = currentRound && currentRound.turnNumber ? currentRound.turnNumber : null;

	$: currentTurn =
		currentRound && currentRound.turns && turnNumber ? currentRound.turns[turnNumber] : null;

	$: currentTurnRef = `/rounds/${roundNumber}/turns/${turnNumber}`;

	function getBestPlayer() {
		return Math.max(...playerData.map((player) => player.points));
	}

	function startGame() {
		update(ref(realtimeDb, data.gameId), {
			started: true
		});
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
			turnNumber: 3,
			turns: [],
			guesses: []
		});
	}

	function startTurn() {
		if (turnNumber >= 1) {
			set(ref(realtimeDb, data.gameId + '/rounds' + roundNumber + '/turns/' + turnNumber), {
				started: true,
				ended: false
			});
		}
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

	{#if lobbyData.started === true && currentRound.started === false}
		<button on:click={startRound}>Runde starten</button>
	{/if}
	{#if currentRound.started === true && currentRound.playerDescribing === $currentPlayerName && turnNumber >= 1}
		<p>Du beschreibst {currentRound.playerBeingDescribed}!</p>
		<GuessingCard {lobbyData} {gameId} {currentTurnRef} {turnNumber} />
	{/if}

	<h4 class="text-xl">Debugging Daten</h4>
	<p>Runde {roundNumber}</p>
	<p>Turn {turnNumber}</p>
	<p>Spieler der beschreibt: {currentRound.playerDescribing}</p>
	<p>Spieler der beschrieben wird: {currentRound.playerBeingDescribed}</p>
{:else}
	<GameEnded {playerData} />
{/if}
