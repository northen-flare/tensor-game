import Phaser from 'phaser';


let tile_size = 40;
let width = tile_size * 12;
let height = tile_size * 10;
// let sound = 1;
// let score = 0;


const random = (num: number) =>  Math.floor(Math.random() * num)

export class TheeHeartsBoot extends Phaser.Scene {
  constructor() {
    super({ key: 'TheeHeartsBootScene' });
  }

  preload = () => {
    this.load.image('loading', 'assets/the-three-hearths/images/loading.png');
    this.load.image('loading2', 'assets/the-three-hearths/images/loading2.png');
  }
  create = () => {
    this.scene.start("TheeHeartsLoadScene");
  }
}

export class TheeHeartsLoad extends Phaser.Scene {
  constructor() {
    super({ key: 'TheeHeartsLoadScene' });
  }
  preload = () => {
    this.load.tilemapTiledJSON('map1', 'assets/the-three-hearths/levels/map.json');
    this.load.image('tiles', 'assets/the-three-hearths/images/tiles4.png');
    this.load.image('menu', 'assets/the-three-hearths/images/menu.png');
    this.load.image('dead', 'assets/the-three-hearths/images/dead.png');
    this.load.spritesheet('sound', 'assets/the-three-hearths/images/sound.png', { frameWidth: 28, frameHeight: 22 });
    this.load.spritesheet('player', 'assets/the-three-hearths/images/player.png', { frameWidth: 40, frameHeight: 40 });
    this.load.image('enemy', 'assets/the-three-hearths/images/enemy.png');
    //game.load.image('bullet', 'images/bullet2.png');
    this.load.image('key', 'assets/the-three-hearths/images/key.png');
    this.load.image('door', 'assets/the-three-hearths/images/door.png');
    this.load.image('heart', 'assets/the-three-hearths/images/heart.png');
    this.load.audio('music', 'assets/the-three-hearths/sounds/music.wav');
    this.load.audio('key', 'assets/the-three-hearths/sounds/key.wav');
    this.load.audio('heart', 'assets/the-three-hearths/sounds/heart.wav');
    this.load.audio('dead', 'assets/the-three-hearths/sounds/dead.wav');
  }
  create = () => {
    this.scene.start("TheeHeartsPlayScene");
  }
}

interface IPlayerProps {
  direction?: number;
  alive?: boolean;
}

type PlayerType = Phaser.GameObjects.Sprite & IPlayerProps;

export class TheeHeartsPlay extends Phaser.Scene {

  player!: PlayerType;
  cursor
  camera: Phaser.Cameras.Scene2D.BaseCamera;

  music: Phaser.Sound.BaseSound;
  key_s: Phaser.Sound.BaseSound;
  heart_s: Phaser.Sound.BaseSound;
  dead_s: Phaser.Sound.BaseSound;


  dead: Phaser.GameObjects.Sprite;
  tween: boolean;

  map: Phaser.Tilemaps.Tilemap;
  layer: Phaser.Tilemaps.TilemapLayer;

  enemies: Phaser.GameObjects.Group
  keys: Phaser.GameObjects.Group
  doors: Phaser.GameObjects.Group
  hearts: Phaser.GameObjects.Group
  walls: Phaser.GameObjects.Group
  number_hearts = 0;

  constructor() {
    super({ key: 'TheeHeartsPlayScene' });
  }
  
  create = () => {
    this.camera = this.cameras.main;

    this.cursor = this.input.keyboard.createCursorKeys();
    //var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //space_key.onDown.add(this.fire, this); 
    this.loadMap();
    this.player = this.createPlayer();

    //this.bullets = game.add.group();
    //this.bullets.createMultiple(20, 'bullet'); 
    
    // Create sounds
    this.music = this.sound.add('music', { volume: 0.4 });
    // this.music.play();
    this.key_s = this.sound.add('key', { volume: 0.3 });
    this.heart_s = this.sound.add('heart', { volume: 0.3 });
    this.dead_s = this.sound.add('dead', { volume: 0.2 });

    this.tween = false;
    this.number_hearts = 0;
    this.dead = this.add.sprite(0, 0, 'dead');
    this.dead.alpha = 0;
  }

  createPlayer = () => {
    const player: PlayerType = this.add.sprite(width / 2, 80, 'player');
    player.setOrigin(0.5, 0.5);
    player.direction = 2;

    this.anims.create({
      key: "down",
      frameRate: 6,
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2 }),
      repeat: -1
    });
    this.anims.create({
      key: "up",
      frameRate: 6,
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
      repeat: -1
    });
    this.anims.create({
      key: "right",
      frameRate: 6,
      frames: this.anims.generateFrameNumbers('player', { start: 7, end: 8 }),
      repeat: -1
    });
    this.anims.create({
      key: "left",
      frameRate: 6,
      frames: this.anims.generateFrameNumbers('player', { start: 10, end: 11 }),
      repeat: -1
    });

    player.alive = true;

    this.physics.world.enableBody(player);

    return player;
  }

  update = () =>  {
    this.physics.collide(this.player, this.layer)
    this.physics.collide(this.player, this.layer);
    this.physics.collide(this.player, this.doors, this.touchedDoor, undefined, this);
    //game.physics.arcade.overlap(this.bullets, this.layer, this.kill_bullet, null, this);
    this.physics.overlap(this.player, this.keys, this.takeKey, undefined, this);
    this.physics.overlap(this.player, this.hearts, this.takeHeart, undefined, this);
    this.physics.overlap(this.player, this.enemies, this.playerDead, undefined, this);
    this.physics.overlap(this.enemies, this.walls, this.enemyWall, undefined, this);

    this.player_movements();
    this.camera_movements();
  }


  enemyWall = (enemy) => {
    if (enemy.body.velocity.x > 0) {
      enemy.body.velocity.x = -200;
      enemy.x -= 10;
    } else if (enemy.body.velocity.x < 0) {
      enemy.body.velocity.x = 200;
      enemy.x += 10;
    } else if (enemy.body.velocity.y > 0) {
      enemy.body.velocity.y = -200;
      enemy.y -= 10;
    } else if (enemy.body.velocity.y < 0) {
      enemy.body.velocity.y = 200;
      enemy.y += 10;
    }
  }

  playerDead = () => {
    if (!this.player.alive)
      return;
    if (this.sound) this.dead_s.play();
    this.player.alive = false;
    

    this.tweens.add({
      targets: this.dead,
      duration: 100,
      ease: Phaser.Math.Easing.Bounce.Out,
      to: { alpha: 1 },
      onComplete: () => {
        this.player.setPosition(width / 2, 80);

        this.camera.setPosition(0, 0);

        this.player.alive = true;
        this.tweens.add({
          targets: this.dead,
          to: { alpha: 0 },
          duration: 1200
        });
      }
    });
    
  }

  touchedDoor = () => {
    if (this.player.body.touching.down)
      this.player.y -= 1;
    else if (this.player.body.touching.up)
      this.player.y += 1;
    else if (this.player.body.touching.left)
      this.player.x += 1;
    else if (this.player.body.touching.right)
      this.player.x -= 1;
  }

  takeKey = (player, key) => {
    this.openDoor(key.getData('key_id'));
    this.key_s.play();
    key.destroy();
  }

  openDoor = (id) =>  {
    this.doors.children.each((d) => {
      if (d.getData('key_id') === id) {
        this.tweens.add({
          targets: d,
          duration: 300,
          scaleX: 0,
          scaleY: 0,
          onComplete: () => d.destroy()
        });
      }
    }, this);
  }

  takeHeart = (player, heart) => {
    if (!heart.alive)
    return;
    
    heart.alive = false;

    this.tweens.add({
      targets: heart,
      duration: 200,
      scaleX: 2,
      scaleY: 2,
    });
  
    this.tweens.add({
      targets: heart,
      duration: 300,
      alpha: 0
    });


    this.tweens.add({
      targets: heart,
      delay: 2200,
      onComplete: () => {
        this.music.resume();
        this.tweens.add({
          targets: this.music,
          volume: 0.4
        });
      }
    });
  
    // this.music.pause();
    this.heart_s.play();
    this.number_hearts += 1;
    if (this.number_hearts == 3)
      this.game_finished();
  }

  camera_movements = () =>  {
    if (this.tween)
    return;
    
    this.tween = true;
    
    const speed = 600;
    let toMove = false;
    if (this.player.y > this.camera.y * height + height) {
      this.camera.y += 1;
      toMove = true;
    } else if (this.player.y < this.camera.y * height) {
      this.camera.y -= 1;
      toMove = true;
    } else if (this.player.x > this.camera.x * width + width) {
      this.camera.x += 1;
      toMove = true;
    } else if (this.player.x < this.camera.x * width) {
      this.camera.x -= 1;
      toMove = true;
    }

    if (toMove) {
      return this.tweens.add({
        targets: this.camera,
        scrollX: this.camera.x * width,
        scrollY: this.camera.y * height,
        duration: speed,
        onComplete: () => {
          this.tween = false}
      });
    }

    this.tween = false;
  }

  player_movements = () => {
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    if (!this.player.alive)
      return;

    const speed = 230;
    if (this.cursor.left.isDown) {
      if (this.tween) this.player.body.velocity.x = -50;
      else this.player.body.velocity.x = -speed;
      this.player.direction = 4;
      this.player.play('left');
    } else if (this.cursor.right.isDown) {
      if (this.tween) this.player.body.velocity.x = 50;
      else this.player.body.velocity.x = speed;
      this.player.direction = 3;
      this.player.play('right');
    } else if (this.cursor.up.isDown) {
      if (this.tween) this.player.body.velocity.y = -50;
      else this.player.body.velocity.y = -speed;
      this.player.direction = 1;
      this.player.play('up');
    } else if (this.cursor.down.isDown) {
      if (this.tween) this.player.body.velocity.y = 50;
      else this.player.body.velocity.y = speed;
      this.player.direction = 2;
      this.player.play('down');
    } else {

      // if (this.player.direction == 1)
      //   this.player.frame = 3;
      // else if (this.player.direction == 2)
      //   this.player.frame = 0;
      // else if (this.player.direction == 3)
      //   this.player.frame = 6;
      // else if (this.player.direction == 4)
      //   this.player.frame = 9;

      this.player.stop();
    }
  }

  loadMap = () => {
    this.map = this.add.tilemap('map1');
    this.map.addTilesetImage('tiles');
    this.layer = this.map.createLayer(0, 'tiles');
    this.map.setCollisionBetween(1, 6);

    this.enemies = this.add.group(
      this.map.createFromObjects('objects', {
        key: 'enemy',
        gid: 16,
        frame: 0,
      })
    );

    this.keys = this.add.group(
      this.map.createFromObjects('objects', {
        key: 'key',
        gid: 24,
        frame: 0,
      })
    );

    this.doors = this.add.group(
      this.map.createFromObjects('objects', {
        key: 'door',
        gid: 25,
        frame: 0,
      })
    );

    this.hearts = this.add.group(
      this.map.createFromObjects('objects', {
        key: 'heart',
        gid: 23,
        frame: 0,
      })
    );
  
    this.walls = this.add.group(
      this.map.createFromObjects('objects', {
        key: 'heart',
        gid: 23,
        frame: 0,
      })
    );

    this.keys.children.each((d) => {
      this.physics.world.enableBody(d);
    }, this);

    this.enemies.children.each((enemy) => {
      this.physics.world.enableBody(enemy);
      if (enemy.move == 1)
        enemy.body.velocity.x = 200;
      else
        enemy.body.velocity.y = 200;
    }, this);

    this.walls.children.each((wall) => {
      this.physics.world.enableBody(wall);
    }, this);

    this.hearts.children.each((heart) => {
      this.physics.world.enableBody(heart);
      heart.alive = true;
    }, this);

    this.doors.children.each((door) => {
      this.physics.world.enableBody(door);
      door.setOrigin(0.5, 0.5);
      door.body.immovable = true;
      door.x += door.width / 2;
      door.y += door.height / 2;
    }, this);

  }

  game_finished = () =>  {
    this.openDoor(4);
  
    const style = {
      font: '25px Arial',
      fill: '#fff',
      align: 'center'
    };
  
    const label = this.add.text(this.camera.x * width + width / 2, this.camera.y * height + height / 2, 'congratulation!\nnow go to the South-East', style);
    label.setOrigin(0.5, 0.5);
    label.setScale(0, 0);


    this.tweens.add({
      targets: label.scale,
      duration: 1500,
      ease: Phaser.Math.Easing.Bounce.Out,
      to: {
        x: 1,
        y: 1
      }
    });


    const p = this.add.emitter(3.5 * width, 4 * height, 200);
    p.makeParticles('heart');
    p.gravity *= -1;
    p.width = 12 * 35;
    p.start(false, 1800, 50);
    p.maxParticleScale = 1.3;
    p.minParticleScale = 0.7;
    p.setYSpeed(-100, -200);
    p.setXSpeed(-5, 5);
  }
}