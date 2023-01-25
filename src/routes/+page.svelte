<svelte:head>
	<title>Tensor Game!</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<script>
	import Game from "$lib/components/Game.svelte";

</script>

<section>
	<Game />
</section>

<style lang="sass">
	section
		display: flex
		flex-direction: column
		justify-content: center
		align-items: center
	
</style>
