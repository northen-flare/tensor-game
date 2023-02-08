<script lang="ts">
	import { onMount } from 'svelte';
	import BubbleShooter from '$lib/games/BubbleShooter/game';

	let canvas: HTMLCanvasElement;
	onMount(async () => {
		const Phaser = (await import('phaser')).default;
		const LoadScene = (await import('$lib/scenes/loadScene')).default;
		const PlayScene = (await import('$lib/scenes/playScene')).default;
		const BreakoutScene = (await import('$lib/scenes/breakoutScene')).default;

		const context = canvas.getContext('2d');
		if (!context) return;

		const shooter = new BubbleShooter(canvas, context);
		shooter.startGame();

		// const config = {
		// 	canvas,
		// 	type: Phaser.CANVAS,
		// 	autoFocus: true,
		// 	width: 800,
		// 	height: 600,
		// 	scale: {
		// 		mode: Phaser.Scale.FIT,
		// 		autoCenter: Phaser.Scale.CENTER_BOTH,
		// 		parent: "game-container",
		// 		autoResize: true
		// 	},
		// 	physics: {
		// 		default: "arcade",
		// 		arcade: {
		// 			gravity: { y: 0 },
		// 			fps: 60,
		// 			debug: false
		// 		}
		// 	},
		// 	scene: [BreakoutScene]
		// };

		// new Phaser.Game(config);
	});
</script>

<div id="game-container" class="container">
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
