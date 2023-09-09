<script lang="ts">
  import Slide from './Slide.svelte';
  import IntroText from '$lib/data/intro.txt?raw';
  import RulesText from '$lib/data/rules.txt?raw';
	import AnswerResult from './AnswerResult.svelte';
	import type { IQuestion } from '$lib/interfaces/Question';
	import Question from './Question.svelte';



	enum FaseEnum {
		'BEGIN',
    'RULES',
		'QUESTION',
		'BID',
		'ANSWER',
		'END',
		'END_VICTORY'
	}

	const API_URL = 'http://localhost:3000';
	const BID_STEP = 20;
	const WIN_COEFF = 2;
	const INITIAL_MONEY = 100;
	const INITIAL_BID = BID_STEP;
	const VICTORY_VALUE = 1000;

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
		return postData('/questions/random', { excluded }).then(({ data }) => data.question);
	}

	function selectAnswer({ detail }: { detail: number}): void {
		currentAnswer = detail;
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
		money = INITIAL_MONEY;
		excluded = [];
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
		await getInfo();
	}

	async function getInfo(): Promise<void> {
		const { decoded } = await postData('/info', { token }).then(({ data }) => data);

		money = decoded.money;
	}

	async function showResult(): Promise<void> {
		await sendAnswer();
		fase = money <= 0
			? FaseEnum.END
			: money >= VICTORY_VALUE
				? FaseEnum.END_VICTORY
				: FaseEnum.ANSWER;
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
	<img class="game-background" src="assets/background.jpg" alt=""/>	
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
	<Question question={currentQuestion} on:select={selectAnswer} />
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
      <h1 class="major-text">Вы проиграли</h1>
			<img src="assets/game-over.png" width="400" alt=""/>
      <button class="button" on:click={restartGame}>Начать сначала</button>
    </div>
	{/if}
	{#if fase === FaseEnum.END_VICTORY}
    <div class="main">
      <div class="major-text">
				Победа!<br/>
				Можно отправляться домой!
			</div>

			<img src="assets/endVictory.jpg" width="400" alt=""/>
    </div>
	{/if}
</div>

<style lang="sass">
.container
  width: 100%
  height: 100vh
  overflow-y: hidden

  .game-background
    width: 100vw
    height: 100vh
    position: absolute


  .money
    color: #fff
    text-align: center
    font-size: 24px
    font-weight: bold
    line-height: 1.4em
    position: relative

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
    position: relative

  .button
    background-color: #000
    padding: 0.5em
    width: max-content
    color: #ffF
    border-radius: 0.5em
    font-weight: bold
    cursor: pointer
</style>
