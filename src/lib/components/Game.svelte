<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	onMount(async () => {
		const context = canvas.getContext('2d');
	});
</script>

<div class="container">
	<canvas
		bind:this={canvas}
		width={800}
		height={640}
	>
		Your browser does not support the HTML5 canvas tag.
	</canvas>
</div>

<style lang="sass">
	canvas
		background-color: #fff
		border: 1px solid #ddd
</style>
