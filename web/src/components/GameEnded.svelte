<script>
	export let playerData;
</script>

<h2 class="text-xl">Spiel beendet!</h2>

<p>Ergebnis:</p>

{#each playerData as player}
	<!-- <h2>
		Glückwunsch! {winner.name} hat mit {winner.points}
		{player.points === 1 ? 'Punkt' : 'Punkte'} gewonnen
	</h2> -->

	<li class="m-2">
		{player.name} hat {player.points}
		{player.points === 1 ? 'Punkt' : 'Punkte'}
	</li>
{/each}
