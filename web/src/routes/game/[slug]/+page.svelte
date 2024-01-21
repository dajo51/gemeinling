<script>
	import { playerName } from '$lib/stores';

	export let data;
	let currentPlayerName = '';
	const subscribe = playerName.subscribe((name) => (currentPlayerName = name));
</script>

<h1>{data.gameId}</h1>
<h2>{currentPlayerName}</h2>
