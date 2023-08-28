<script lang="ts">
  import Slide from './Slide.svelte';
  import IntroText from '$lib/data/intro.txt?raw';
  import RulesText from '$lib/data/rules.txt?raw';
	import AnswerResult from './AnswerResult.svelte';

	interface IQuestion {
		id: number;
		text: string;
		options: string[];
	}

	enum FaseEnum {
		'BEGIN',
    'RULES',
		'QUESTION',
		'BID',
		'ANSWER',
		'END'
	}

	const API_URL = 'http://127.0.0.1:3000';
	const BID_STEP = 20;
	const WIN_COEFF = 2;
	const INITIAL_MONEY = 100;
	const INITIAL_BID = BID_STEP;

	let money: number = INITIAL_MONEY;
	let fase: FaseEnum = FaseEnum.BEGIN;

	let currentAnswer: number | null = null;
	let currentBid: number = INITIAL_BID;
	let currentQuestion: IQuestion;
	let excluded: number[] = [];
	let token: string;

	let answerResult: boolean;

	$: possibleWin = currentBid * WIN_COEFF;
	$: canIncrease = currentBid + BID_STEP <= money;
	$: canDecrease = currentBid - BID_STEP > 0;

	async function postData(route: string, data = {}): Promise<any> {
		const response = await fetch(API_URL + route, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		return response.json();
	}

	async function register(): Promise<void> {
		const response = await postData('/register', { username: 'guest' }).then(({ data }) => data);

		token = response.token;
	}

	async function getQuestion(): Promise<IQuestion> {
		return postData('/questions/random', {}).then(({ data }) => data.question);
	}

	function selectAnswer(answer: number): void {
		currentAnswer = answer;
		fase = FaseEnum.BID;
	}

	function dropAnswer(): void {
		fase = FaseEnum.QUESTION;
	}

	function increaseTheBid(): void {
		if (canIncrease) {
			currentBid += BID_STEP;
		}
	}

	function decreaseTheBid(): void {
		if (canDecrease) {
			currentBid -= BID_STEP;
		}
	}

	async function getRules(): Promise<void> {
		await register();
    fase = FaseEnum.RULES;
	}
  
  async function startGame(): Promise<void> {
    await nextQuestion();
  }

	function restartGame(): void {
		fase = FaseEnum.BEGIN;
	}

	async function sendAnswer(): Promise<void> {
		const { result, newToken } = await postData('/answer', {
			token,
			question: currentQuestion.id,
			answer: currentAnswer,
			bet: currentBid
		}).then(({ data }) => data);

		token = newToken;
		answerResult = result;
		getInfo();
	}

	async function getInfo(): Promise<void> {
		const { decoded } = await postData('/info', { token }).then(({ data }) => data);

		money = decoded.money;
	}

	async function showResult(): Promise<void> {
		await sendAnswer();
		fase = FaseEnum.ANSWER;
	}

	async function nextQuestion(): Promise<void> {
		if (currentAnswer) {
			excluded.push(currentAnswer.id);
		}
		currentQuestion = await getQuestion();
		currentBid = BID_STEP;
		fase = FaseEnum.QUESTION;
	}
</script>

<div id="game-container" class="container">
	{#if ![FaseEnum.BEGIN, FaseEnum.RULES, FaseEnum.END].includes(fase)}
		<h3 class="money">Деньги: {money}</h3>
	{/if}
	{#if fase === FaseEnum.BEGIN}
    <Slide contentText={IntroText} buttonText={'Ладно'} on:continue={getRules}/>
	{/if}
  {#if fase === FaseEnum.RULES}
    <Slide contentText={RulesText} buttonText={'Вперёд'} on:continue={startGame}/>
	{/if}
	{#if fase === FaseEnum.QUESTION}
  <div class="main">
    <div class="question">{currentQuestion.text}</div>
		<div class="question-options">
      {#each currentQuestion.options as option, index (index)}
      <button class="question-option" on:click={() => selectAnswer(index)}>{option}</button>
			{/each}
		</div>
  </div>
	{/if}
	{#if fase === FaseEnum.BID}
  <div class="main">
    <div class="major-text">
      <img src="assets/getYourBid.png" width="300" alt=""/>
      <div>Делайте ваши ставки</div>
    </div>
    <div class="major-text">
        <div>Текущая ставка: {currentBid}</div>
        <div>Вы можете выиграть: {possibleWin}</div>
      </div>
      <div>
        <button class="button" on:click={dropAnswer}>Назад</button>
        <button class="button" on:click={decreaseTheBid}>Опустить ставку</button>
        <button class="button" on:click={increaseTheBid}>Поднять ставку</button>
        <button class="button" on:click={showResult}>Сделано</button>
      </div>
		</div>
	{/if}
	{#if fase === FaseEnum.ANSWER}
    <AnswerResult answerResult={answerResult} currentBid={currentBid} on:nextQuestion={nextQuestion} />
	{/if}
	{#if fase === FaseEnum.END}
    
    <div class="main">
      <h1>Вы проиграли</h1>
      <button class="button" on:click={restartGame}>Начать сначала</button>
    </div>
	{/if}
</div>

<style lang="sass">
.container
  background-image: url('assets/background.jpg')
  width: 100%
  background-repeat: no-repeat
  background-size: cover

  .money
    color: #fff
    text-align: center
    font-size: 24px
    font-weight: bold
    line-height: 1.4em

  .bid-container
    display: flex

  .major-text
    text-align: center
    font-size: 24px
    font-weight: bold
    line-height: 1.4em
    color: #fff
    padding: 20px
    background-color: rgba(0,0,0,0.5)
    border-radius: 0.5em

  .main
    display: flex
    height: 100vh
    flex-direction: column
    justify-content: center
    align-items: center
    gap: 3em

  .question
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
    grid-template-columns: 1fr
    gap: 16px

  .question-option
    background-color: #000
    color: #fff
    padding: 10px 20px
    border-radius: 0.5em
    cursor: pointer

  .button
    background-color: #000
    padding: 0.5em
    width: max-content
    color: #ffF
    border-radius: 0.5em
    font-weight: bold
    cursor: pointer
</style>
