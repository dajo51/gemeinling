<script>
	import { realtimeDb } from '$lib/firebase/firebase';
	import { ref, onValue, set } from 'firebase/database';
	import { goto } from '$app/navigation';

	let gameId = '';
	let gameFound = '';
	let playerNameMissing = false;
	let playerName = '';
	let lobbyData;

	const generateGameId = (length) => {
		return Array(length)
			.fill('x')
			.join('')
			.replace(/x/g, () => {
				return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
			});
	};

	async function createRealtimeGameRoom({ playerName }) {
		const gameId = generateGameId(8);

		set(ref(realtimeDb, gameId), {
			players: [{ name: playerName, points: 0 }],
			createdAt: new Date()
		});
		return gameId;
	}

	async function getLobby(gameId) {
		onValue(ref(realtimeDb, gameId), (snapshot) => {
			const data = snapshot.val();
			if (data) {
				gameFound = 'found';
			} else {
				gameFound = 'notFound';
			}
		});
	}

	async function createLobby() {
		if (playerName.trim() === '') {
			console.error('Player name is required');
			playerNameMissing = true;
			return;
		}

		try {
			const newGameId = await createRealtimeGameRoom({ playerName });
			console.log(`New game room created with ID: ${newGameId}`);
			await goto(`/game/${newGameId}`);
		} catch (error) {
			console.error('Failed to create game room:', error);
		}
	}

	async function joinLobby() {
		if (playerName.trim() === '') {
			console.error('Player name is required');
			playerNameMissing = true;
			return;
		}
		await getLobby(gameId);
		if (gameFound === 'found') {
			await goto(`/game/${gameId}`);
		}
	}
</script>

<main class="flex justify-center items-center h-screen">
	<div class="card bg-white shadow-lg rounded p-5 max-w-sm w-full">
		<h1 class="text-xl font-bold mb-4 text-center">Willkommen zu Gemeinling!</h1>
		<input
			type="text"
			placeholder="Spiel ID"
			bind:value={gameId}
			class="border p-2 rounded w-full mb-4"
		/>
		<input
			type="text"
			placeholder="Dein Name"
			bind:value={playerName}
			class="border p-2 rounded w-full mb-4"
		/>
		<button class="bg-blue-500 text-white rounded p-2 w-full mb-2" on:click={joinLobby}
			>Spiel beitreten</button
		>
		<button class="bg-green-500 text-white rounded p-2 w-full" on:click={createLobby}
			>Neues Spiel erstellen</button
		>
		{#if gameFound === 'notFound'}
			<div
				class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2"
				role="alert"
			>
				<span class="block sm:inline text-center">Spiel ID nicht gefunden!</span>
			</div>
		{/if}
		{#if gameFound === 'found'}
			<div
				class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-2"
				role="alert"
			>
				<span class="block sm:inline">Spiel gefunden! Verbinde...</span>
			</div>
		{/if}
		{#if playerNameMissing === true}
			<div
				class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2"
				role="alert"
			>
				<span class="block sm:inline">Spielername ist erforderlich!</span>
			</div>
		{/if}
	</div>
</main>

<style>
	/* Custom styles if needed */
</style>
