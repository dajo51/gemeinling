<script>
	import { currentPlayerName } from '$lib/stores';
	import { ref, onValue, update, set } from 'firebase/database';
	import { realtimeDb } from '$lib/firebase/firebase';

	export let data;
	let lobbyData = {};
	let roundNumber = 1;
	let characteristicsList = ['nett', 'freundlich', 'lieb', 'gemein'];
	let randomCharateristic;

	const playersRef = ref(realtimeDb, data.gameId + '/players');
	onValue(playersRef, (snapshot) => {
		lobbyData = snapshot.val();
	});

	function startGame() {
		randomCharateristic =
			characteristicsList[Math.floor(Math.random() * characteristicsList.length)];
		characteristicsList = characteristicsList.filter((item) => item !== randomCharateristic);
		update(ref(realtimeDb, data.gameId), {
			started: true,
			characteristicsList: characteristicsList
		});
		set(ref(realtimeDb, data.gameId + '/rounds/' + roundNumber), {
			started: true,
			characteristic: randomCharateristic
		});
	}

	$: processedLobbyData =
		lobbyData && typeof lobbyData === 'object' ? Object.values(lobbyData) : [];
</script>

<h1 class="text-2xl">Spiel ID: {data.gameId}</h1>
<h2 class="text-xl">Du bist: {$currentPlayerName}</h2>
<ul class="list">
	{#each processedLobbyData as player}
		<li class="m-2">
			{player.name} hat {player.points}
			{player.points === 1 ? 'Punkt' : 'Punkte'}
		</li>
	{/each}
</ul>

<button on:click={startGame}>Spiel starten</button>
