type ColorType = string | CanvasGradient | CanvasPattern;

class Ball {
	x: number;
	y: number;
	radius: number;
	color: ColorType;

	constructor(x: number, y: number, radius: number, color: ColorType) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
	}

	draw(context: CanvasRenderingContext2D) {
		context.beginPath()
		context.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false)
		context.fillStyle = this.color
		context.fill()
	}
}

class Shooter extends Ball {
	velocity: { x: number; y: number };

	constructor(x: number, y: number, radius: number, color: ColorType, velocity: { x: number; y: number}) {
		super(x, y, radius, color)
		this.velocity = velocity
	}

	update(context: CanvasRenderingContext2D) {
		this.draw(context);
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}


class Particle extends Shooter {
	alpha: number;
	friction: number;

	constructor(
		x: number,
		y: number,
		radius: number,
		color: ColorType,
		velocity: { x: number, y: number },
		friction: number
	) {
		super(x, y, radius, color, velocity);
		this.alpha = 1;
		this.friction = friction;
	}

	draw(context: CanvasRenderingContext2D) {
		context.save()
		context.globalAlpha = this.alpha
		context.beginPath()
		context.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false)
		context.fillStyle = this.color
		context.fill()
		context.restore()
	}

	update(context: CanvasRenderingContext2D) {
		this.draw(context)
		this.velocity.x *= this.friction;
		this.velocity.y *= this.friction;
		this.x = this.x + this.velocity.x * 2
		this.y = this.y + this.velocity.y * 2
		this.alpha -= 0.01
	}
}


export default class BubbleShooter {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	size: {
		width: number;
		height: number;
	};

	// scoreEl = document.getElementById('scoreEl')
	// highestEl = document.getElementById('highestEl')
	// startGameBtn = document.getElementById('startGameBtn')
	// modelEl = document.getElementById('modelEl')
	// bigScoreEl = document.getElementById('bigScoreEl')
	friction = 0.98;
	x: number;
	y: number;
	player?: Ball;
	projectiles: Shooter[] = [];
	enemies: Shooter[] = [];
	particles: Particle[] = [];
	score = 0;
	highest = localStorage.getItem('highest') || 0;

	animationFrame: number | null = null;
	spawnEnemiesInterval?: NodeJS.Timeout;
	spawnTime = 1000;

	constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this.canvas = canvas;
		this.context = context;
		this.size = {
			width: canvas.width,
			height: canvas.height,
		};
		this.x = this.size.width / 2;
		this.y = this.size.height / 2;
	}

	
	updateScore = (times = 1) => {
		this.spawnTime *= 0.9995;
		this.score += 100 * times;
		// scoreEl.innerHTML = score
	}

	// Calculate Velocity from center(x, y) to (x1,y1)
	calculateVelocity = (
		x: number,
		y: number,
		x1 = this.size.width / 2,
		y1 = this.size.height / 2
	) => {
		const angle = Math.atan2(y1 - y, x1 - x);
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle),
		};

		return velocity;
	}

	// Animation
	loop = () => {
		if (!this.player) return;

		this.animationFrame = requestAnimationFrame(this.loop);
		this.context.fillStyle = 'rgba(0,0,0,0.1)';
		this.context.fillRect(0, 0, this.size.width, this.size.height);
		this.player.draw(this.context);

		// Updates and remove particles
		this.particles.forEach((particle, index) => {
			if (particle.alpha <= 0) {
				setTimeout(() => {
					this.particles.splice(index, 1)
				}, 0)
			} else {
				particle.update(this.context)
			}
		})

		// Update and remove projectiles
		this.projectiles.forEach((projectile, index) => {
			projectile.update(this.context)
			if (
				projectile.x + projectile.radius < 1 ||
				projectile.x - projectile.radius > this.size.width ||
				projectile.y + projectile.radius < 0 ||
				projectile.y - projectile.radius > this.size.height
			) {
				setTimeout(() => {
					this.projectiles.splice(index, 1)
				}, 0)
			}
		})

		// Update & Destroy Enemies, Create Explosions & Increase Score
		this.enemies.forEach((enemy, index) => {
			if (!this.player) return;

			enemy.update(this.context);

			// Calculate distance between player(player.x, player.y) and enemy(enemy.x, enemy.y) using Math.hypot(perpendicular, base) which gives hypotenuse / distance between them
			const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y)

			// Checking if player and enemy is collided
			if (dist - enemy.radius - this.player.radius < 1) {
				this.stopGame()
			}

			this.projectiles.forEach((projectile, projectileIndex) => {
				const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

				// When Projectiles touch Enemy
				if (dist - enemy.radius - projectile.radius < 0) {
					// Create Particles explosion
					for (let i = 0; i < enemy.radius * 1; i++) {
						this.particles.push(
							new Particle(
								projectile.x,
								projectile.y,
								Math.random() * 3,
								enemy.color,
								{
									x: (Math.random() - 0.5) * (Math.random() * 9.8 - 0.5),
									y: (Math.random() - 0.5) * (Math.random() * 9.8 - 0.5),
								},
								this.friction
							)
						)
					}

					// Check if enemy is to be removed or not
					if (enemy.radius - 10 > 10) {
						this.updateScore()
						enemy.radius -= 8
						setTimeout(() => {
							this.projectiles.splice(projectileIndex, 1)
						}, 0);
					} else {
						this.updateScore(2.5);
						setTimeout(() => {
							this.enemies.splice(index, 1)
							this.projectiles.splice(projectileIndex, 1)
						}, 0);
					}
				}
			})
		})
	}

	// Shoot Enemy
	shootEnemy = (event: MouseEvent) => {
		const x = this.size.width / 2;
		const y = this.size.height / 2;

		const velocity = this.calculateVelocity(x, y, event.offsetX, event.offsetY)
		velocity.x *= 5.5;
		velocity.y *= 5.5;

		this.projectiles.push(new Shooter(x, y, 5, 'white', velocity))
	}

	// Reinitializing Variables for Starting a New Game
	init = () => {
		this.player = new Ball(this.x, this.y, 10, 'white')
		this.projectiles = []
		this.enemies = []
		this.particles = []
		this.score = 0
		this.spawnTime = 1000
		// this.highestEl.innerHTML = score
		// this.scoreEl.innerHTML = score
		// this.highestEl.innerHTML = highest
	}

	// Stop Game
	stopGame = () => {
		clearInterval(this.spawnEnemiesInterval);
		this.animationFrame && cancelAnimationFrame(this.animationFrame); // Exit Animation
		this.canvas.removeEventListener('click', this.shootEnemy) // Stop Shooting
		// modelEl.style.display = 'flex' // Dialogue box
		// if (score > highest) {
		// 	highest = score
		// 	localStorage.setItem('highest', highest)
		// }
		// bigScoreEl.innerHTML = score // Poping score
	}

	// Spawning Random Enemies
	spawnEnemies = () => {
		// Spawn a enemy every second
		this.spawnEnemiesInterval = setTimeout(() => {
			let x, y;
			const radius = Math.random() * 16 + 14;
			if (Math.random() < 0.5) {
				x = Math.random() < 0.5 ? 0 - radius : this.size.width + radius;
				y = Math.random() * this.size.height;
			} else {
				x = Math.random() * this.size.width;
				y = Math.random() < 0.5 ? 0 - radius : this.size.height + radius;
			}
			const color = `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`
			this.enemies.push(new Shooter(x, y, radius, color, this.calculateVelocity(x, y)))
			this.spawnEnemies()
		}, this.spawnTime)
	}

	// Start New Game
	startGame = () => {
		this.x = this.size.width / 2;
		this.y = this.size.height / 2;
		this.canvas.addEventListener('click', this.shootEnemy);
		this.init();
		this.loop();
		clearInterval(this.spawnEnemiesInterval);
		this.spawnEnemies();
		// modelEl.style.display = 'none'
	}
}

