<script>
	import { db } from '$lib/firebase/firebase';
	import { doc, getDoc } from 'firebase/firestore';

	let gameId = '';
	let gameFound = '';
	let lobbyData;

	async function getLobby(lobbyId) {
		try {
			const docRef = doc(db, 'games', lobbyId);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				let data = docSnap.data();
				console.log(docSnap.data());
				gameFound = 'found';
				return {
					data
				};
			} else {
				console.log('No such document!');
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
		lobbyData = await getLobby(gameId);
		console.log('lobbydata', lobbyData);
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
			<p class="text-red-500">Spiel ID nicht gefunden!</p>
		{/if}
		{#if gameFound === 'found'}
			<p class="text-green-500">Spiel gefunden! Verbinde..</p>
		{/if}
	</div>
</main>

<style>
	/* Custom styles if needed */
</style>
