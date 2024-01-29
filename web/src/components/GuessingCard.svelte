<script>
	import { ref, update } from 'firebase/database';
	import { realtimeDb } from '$lib/firebase/firebase'; // Adjust the import path as necessary

	export let lobbyData;
	export let gameId;

	let turnNumber = 1;
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
		updates[
			gameId +
				'/rounds/' +
				lobbyData.roundNumber +
				'/turns/' +
				turnNumber +
				'/characteristics/' +
				selectedCharacteristic
		] = sliderValue;

		try {
			await update(ref(realtimeDb, lobbyData.gameId), updates);
			console.log('Rating submitted successfully');
		} catch (error) {
			console.error('Error submitting rating:', error);
		}
	}
</script>

<div>
	<p>Eigenschaft: {selectedCharacteristic} {sliderValue}</p>
	<input type="range" min="0" max="20" bind:value={sliderValue} />
	<button on:click={submitRating}>Bewertung abgeben</button>
</div>
