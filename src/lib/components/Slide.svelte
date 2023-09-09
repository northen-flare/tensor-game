<script lang="ts">
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  export let contentText: string;
  export let buttonText: string;

  function handleContinue() {
    dispatch('continue');
  }
</script>

<div class="main">
	<div class="content">
    <div>
      {contentText}
    </div>
	</div>
	<button class="button" on:click={handleContinue}>{buttonText}</button>
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

  .button
    background-color: #000
    padding: 1em
    width: max-content
    color: #ffF
    border-radius: 0.5em
    font-weight: bold
    cursor: pointer

  @media screen and (max-width: 48em)
    .content
      width: 100%
      font-size: 20px

      div
        margin: 20px

    .button
      width: 100%
      position: fixed
      bottom: 0
		
</style>
