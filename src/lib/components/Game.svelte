<script lang="ts">
	import { onMount } from 'svelte';
	

	let canvas: HTMLCanvasElement;
	onMount(async () => {
		const Phaser = (await import('phaser')).default;
		const LoadScene = (await import('$lib/scenes/loadScene')).default;
		const PlayScene = (await import('$lib/scenes/playScene')).default;

		// const context = canvas.getContext('2d');

		const config = {
			type: Phaser.AUTO,
			parent: "game-container",
			autoFocus: true,
			width: 400,
			height: 320,
			scale: {
				mode: Phaser.Scale.FIT,
				autoCenter: Phaser.Scale.CENTER_BOTH,
				parent: "game-container",
				width: 480,
				height: 320,
				autoResize: true
			},
			physics: {
				default: "arcade",
				arcade: {
					gravity: { y: 0 },
					fps: 60,
					debug: false
				}
			},
			scene: [LoadScene, PlayScene]
		};

		new Phaser.Game(config);
	});

	
</script>

<div id="game-container" class="container">
	<!-- <canvas
		bind:this={canvas}
		width={800}
		height={640}
	>
		Your browser does not support the HTML5 canvas tag.
	</canvas> -->
</div>

<style lang="sass">
	canvas
		background-color: #fff
		border: 1px solid #ddd
</style>
