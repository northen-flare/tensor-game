<script lang="ts">
	enum FaseEnum {
		'BEGIN',
		'QUESTION',
		'BID',
		'END'
	}

	let money: number = 20;
	let round: number = 0;
	let fase: FaseEnum = FaseEnum.BEGIN;

	let currentAnswer: number | null = null;
	let currentBid: number = 20;

	function selectAnswer(answer: number): void {
		currentAnswer = answer;
		fase = FaseEnum.BID;
	}

	function dropAnswer(): void {
		fase = FaseEnum.QUESTION;
	}

	function increaseTheBid(): void {
		currentBid +=20;
	}

	function decreaseTheBid(): void {
		currentBid -=20;
	}

	function startGame(): void {
		fase = FaseEnum.QUESTION;
	}

	function restartGame(): void {
		fase = FaseEnum.BEGIN;
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
		<div>Выберите вариант ответа, где все методы есть методами словаря dict().</div>
		<div>
			<button on:click={() => selectAnswer(0)}>clear(), get(), push(), index()</button><br/>
			<button on:click={() => selectAnswer(1)}>update(), remove(), values(), copy()</button><br/>
			<button on:click={() => selectAnswer(2)}>setdefault(), popitem(), pop(), fromkeys()</button><br/>
			<button on:click={() => selectAnswer(3)}>get(), set(), keys(), items()</button>
		</div>
	{/if}
	{#if fase === FaseEnum.BID}
		<div>Делайте ваши ставки</div>
		<div>
			<button on:click={dropAnswer}>Назад</button>
			<button on:click={decreaseTheBid}>Опустить ставку</button>
			<span>Текущая ставка: {currentBid}</span>
			<button on:click={increaseTheBid}>Поднять ставку</button>
		</div>
	{/if}
	{#if fase === FaseEnum.END}
		<h1>Вы проиграли</h1>
		<button on:click={restartGame}>Начать сначала</button>
	{/if}

</div>

<style lang="sass">

</style>
