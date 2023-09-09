<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let bid: number;

	$: possibleWin = bid * 2;

	function dropAnswer(): void {
		dispatch('dropAnswer');
	}
	
	function decreaseTheBid(): void {
		dispatch('changeBid');
	}
	
	function increaseTheBid(): void {
	}
	
	function changeBid(): void {
		dispatch('changeBid', bid);
	}
	
	function showResult(): void {
		dispatch('showResult');
	}
	
</script>

<div class="main">
	<div class="major-text">
		<img src="assets/getYourBid.png" width="300" alt=""/>
		<div>Делайте ваши ставки</div>
	</div>
	<div class="major-text">
			<div>Текущая ставка: {bid}</div>
			<div>Вы можете выиграть: {possibleWin}</div>
	</div>
	<div>
		<button class="button" on:click={dropAnswer}>Назад</button>
		<button class="button" on:click={decreaseTheBid}>Опустить ставку</button>
		<button class="button" on:click={increaseTheBid}>Поднять ставку</button>
		<button class="button" on:click={showResult}>Сделано</button>
	</div>
</div>

<style lang="sass">

</style>