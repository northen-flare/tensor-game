<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let answerResult: boolean;
	export let currentBid: number;
	
	const WIN_COEFF = 2;

	$: possibleWin = currentBid * WIN_COEFF;

	function nextQuestion() {
    dispatch('nextQuestion');
	}
</script>

<div class="main">
	{#if answerResult}
	<div class="text">
		Верно! Вы выйграли {possibleWin}
	</div>
	{:else}
	<div class="text">
		Неверно! Вы проиграли {currentBid}
	</div>
	<img src="assets/sadCat.jpg" width="300" alt=""/>
	{/if}
	<button class="button" on:click={nextQuestion}>Играть дальше</button>
</div>

<style lang="sass">
.main
	display: flex
	height: 100vh
	flex-direction: column
	justify-content: center
	align-items: center
	gap: 3em

.text
	text-align: center
	font-size: 24px
	font-weight: bold
	line-height: 1.4em
	color: #fff
	padding: 20px
	background-color: rgba(0,0,0,0.5)
	border-radius: 0.5em

.button
	background-color: #000
	padding: 0.5em
	width: max-content
	color: #fff
	border-radius: 0.5em
	font-weight: bold
	cursor: pointer
</style>