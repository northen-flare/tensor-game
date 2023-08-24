<script lang="ts">
	import InitQuestions from '$lib/data/questions.json';
	
	interface IQuestion {
		id: number;
		text: string;
		options: string[];
		answer: number;
	}

	enum FaseEnum {
		'BEGIN',
		'QUESTION',
		'BID',
		'ANSWER',
		'END'
	}

	
	const BID_STEP = 20;
	const WIN_COEFF = 2;
	const INITIAL_MONEY = 20;
	const INITIAL_BID = BID_STEP;

	let availableQuestions: IQuestion[] = [...InitQuestions];

	let money: number = INITIAL_MONEY;
	let round: number = 0;
	let fase: FaseEnum = FaseEnum.BEGIN;

	let currentAnswer: number | null = null;
	let currentBid: number = INITIAL_BID;
	let currentQuestion: IQuestion;

	$: answerResult = currentQuestion && currentAnswer === currentQuestion.answer;
	$: possibleWin = currentBid * WIN_COEFF;
	$: canIncrease = currentBid + BID_STEP <= money;
	$: canDecrease = currentBid - BID_STEP > 0;

	function getRandomInt(max: number): number {
		return Math.floor(Math.random() * max);
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

	function startGame(): void {
		availableQuestions = [...InitQuestions];
		nextQuestion();
	}

	function restartGame(): void {
		fase = FaseEnum.BEGIN;
	}

	function approveWin(): void {
		if (answerResult) {
			money += possibleWin;
		} else {
			money -= currentBid;
		}
	}

	function showResult(): void {
		approveWin();
		fase = FaseEnum.ANSWER;
	}

	function nextQuestion(): void {
		if (currentQuestion) {
			const currentQuestionId = availableQuestions.findIndex(({ id }) => currentQuestion.id === id);
			availableQuestions.splice(currentQuestionId, 1);
		}
		currentQuestion = availableQuestions[getRandomInt(availableQuestions.length)];
		currentBid = BID_STEP;
		fase = FaseEnum.QUESTION;
	}
</script>

<div id="game-container" class="container">
	{#if ![FaseEnum.BEGIN, FaseEnum.END].includes(fase)}
		<h1>Раунд {round}</h1>
		<h3>Деньги: {money}</h3>
	{/if}
	{#if fase === FaseEnum.BEGIN}
		<div>
			"Оооох...а что вчера было?...Как же болит голова...О, привет! Похоже мы отлично отметили профессиональный праздник и находимся черт знает где...Подожди...это что... ДАГЕСТАН?! Надеюсь, мы хотя бы не потратили все до последней фишки в этом чертовом казино! Нашел! ЧТО?! Всего 20$?! И как мы планируем выбираться отсюда без денег на билеты? Не знаю как ты, а вижу только один выход...придется вернуться и забрать своё!"
			<button on:click={startGame}>Начать</button>
		</div>
	{/if}
	{#if fase === FaseEnum.QUESTION}
		<div>{currentQuestion.text}</div>
		<div>
			{#each currentQuestion.options as option, index (index)}
				<button on:click={() => selectAnswer(index)}>{option}</button><br/> 
			{/each}
		</div>
	{/if}
	{#if fase === FaseEnum.BID}
		<div>Делайте ваши ставки</div>
		<div>
			<button on:click={dropAnswer}>Назад</button>
			<button on:click={decreaseTheBid}>Опустить ставку</button>
			<span>Текущая ставка: {currentBid}</span>
			<span>Вы можете выиграть: {possibleWin}</span>
			<button on:click={increaseTheBid}>Поднять ставку</button>
			<button on:click={showResult}>Сделано</button>
		</div>
	{/if}
	{#if fase === FaseEnum.ANSWER}
		{#if answerResult}
			Верно! Вы выйграли {possibleWin}
			{:else}
			Неверно! Вы проиграли {currentBid}
		{/if}
		<button on:click={nextQuestion}>Играть дальше</button>
	{/if}
	{#if fase === FaseEnum.END}
		<h1>Вы проиграли</h1>
		<button on:click={restartGame}>Начать сначала</button>
	{/if}

</div>

<style lang="sass">

</style>
