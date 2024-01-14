<script>
	import { db } from '$lib/firebase/firebase';
	import { doc, getDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';

	let gameId = '';
	let gameFound = '';
	let lobbyData;

	async function getLobby(lobbyId) {
		try {
			const docRef = doc(db, 'games', lobbyId);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				gameFound = 'found';
			} else {
				gameFound = 'notFound';
			}
		} catch (error) {
			console.error('Error fetching data: ', error);
		}
	}

	async function createLobby() {
		// Logic to create a new lobby in Firebase
	}

	async function joinLobby() {
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
		<button class="bg-blue-500 text-white rounded p-2 w-full mb-2" on:click={joinLobby}
			>Spiel ID eingeben</button
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
	</div>
</main>

<style>
	/* Custom styles if needed */
</style>
