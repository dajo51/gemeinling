<script>
	import { db } from '$lib/firebase/firebase';
	import { addDoc, collection } from 'firebase/firestore';
	import { goto } from '$app/navigation';

	export let gameID;
	let playerName = '';

	async function createGameRoom({ playerName, maxPoints }) {
		try {
			const gamesCollectionRef = collection(db, 'games');

			const docRef = await addDoc(gamesCollectionRef, {
				players: [{ name: playerName, points: 0 }],
				createdAt: new Date(),
				maxPoints
			});
			return docRef.id;
		} catch (error) {
			console.error('Error adding document: ', error);
			throw error;
		}
	}

	const handleSubmit = async () => {
		if (playerName.trim() === '') {
			console.error('Game name is required');
			return;
		}

		try {
			const newGameId = await createGameRoom({ playerName, maxPoints });
			console.log(`New game room created with ID: ${newGameId}`);
			await goto(`/game/${newGameId}`);
		} catch (error) {
			console.error('Failed to create game room:', error);
		}
	};
</script>

<main class="flex justify-center items-center h-screen">
	<div class="bg-white shadow-lg rounded p-5 max-w-md w-full">
		<h1 class="text-xl font-bold mb-4 text-center">Neues Spiel erstellen</h1>
		<form on:submit|preventDefault={handleSubmit}>
			<div class="mb-4">
				<label for="roomName" class="block text-gray-700 text-sm font-bold mb-2">Dein Name:</label>
				<input
					type="text"
					id="playerName"
					bind:value={playerName}
					required
					class="border p-2 rounded w-full"
				/>
			</div>
			<div class="mb-4">
				<label for="maxPlayers" class="block text-gray-700 text-sm font-bold mb-2"
					>Maximale Punktzahl:</label
				>
				<input
					type="number"
					id="maxPoints"
					bind:value={maxPoints}
					min="1"
					max="30"
					required
					class="border p-2 rounded w-full"
				/>
			</div>
			<button
				type="submit"
				class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-2"
			>
				Spiel erstellen
			</button>
		</form>
	</div>
</main>
