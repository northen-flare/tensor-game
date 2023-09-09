<script lang="ts">
	import type { IQuestion } from '$lib/interfaces/Question';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let question: IQuestion;

	function selectAnswer(index: number) {
		dispatch('select', index);
	}
</script>

<div class="main">
	<div class="content">{question.text}</div>
	<div class="question-options">
		{#each question.options as option, index (index)}
		<button class="question-option" on:click={() => selectAnswer(index)}>{option}</button>
		{/each}
	</div>
</div>

<style lang="sass">
  .main
    display: flex
    height: 100vh
    flex-direction: column
    justify-content: center
    align-items: center
    gap: 3em
    position: relative

  .content
    width: 50%
    text-align: center
    font-size: 24px
    font-weight: bold
    line-height: 1.4em
    color: #fff
    background-color: rgba(0,0,0,0.5)
    padding: 20px
    border-radius: 0.5em

  .question-options
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 16px
    padding: 20px

  .question-option
    background-color: #000
    color: #fff
    padding: 10px 20px
    border-radius: 0.5em
    cursor: pointer

  @media screen and (max-width: 48em)
    .content
      width: 100%
      font-size: 20px

      div
        margin: 20px

		.question-options
	    display: grid
	    grid-template-columns: 1fr
	    gap: 8px
	    padding: 20px
    
		
</style>