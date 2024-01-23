<script>
	import { currentPlayerName } from '$lib/stores';

	export let data;
</script>

<h1>{data.gameId}</h1>
<h2>{$currentPlayerName}</h2>
