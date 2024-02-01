<script>
	import { ref, update } from 'firebase/database';
	import { realtimeDb } from '$lib/firebase/firebase'; // Adjust the import path as necessary

	export let lobbyData;
	export let gameId;
	export let currentTurnRef;
	export let turnNumber;

	let characteristicsList = lobbyData.characteristics;
	let selectedCharacteristic =
		characteristicsList[Math.floor(Math.random() * characteristicsList.length)];
	let sliderValue = 0;

	export let ratedCharacteristic = {};

	$: ratedCharacteristic = {
		characteristic: selectedCharacteristic,
		value: sliderValue
	};

	async function submitRating() {
		const updatedCharacteristicsList = characteristicsList.filter(
			(item) => item !== selectedCharacteristic
		);

		const updates = {};
		updates['/characteristics'] = updatedCharacteristicsList;
		updates[currentTurnRef + '/characteristics/' + selectedCharacteristic] = sliderValue;

		try {
			await update(ref(realtimeDb, gameId), updates);
			await update(ref(realtimeDb, gameId + '/rounds/' + lobbyData.roundNumber), {
				turnNumber: turnNumber - 1
			});
			console.log('Rating submitted successfully');
		} catch (error) {
			console.error('Error submitting rating:', error);
		}
	}
</script>

<div>
	<p>Auf einer Skala von 1 bis 20 er/sie {sliderValue} {selectedCharacteristic}</p>
	<input type="range" min="0" max="20" bind:value={sliderValue} />
	<button on:click={submitRating}>Bewertung abgeben</button>
</div>
