import Phaser from 'phaser';



Game = {};
var tile_size = 40;
var w = tile_size * 12;
var h = tile_size * 10;
var sound = 1;
var score = 0;


const random = (num: number) =>  Math.floor(Math.random() * num)

export class TheeHeartsBoot extends Phaser.Scene {
  constructor() {
    super({ key: 'TheeHeartsBootScene' });
  }

  preload = () => {
    this.load.image('loading', '../images/loading.png');
    this.load.image('loading2', '../images/loading2.png');
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
    this.load.tilemapTiledJSON('map1', 'levels/map.json');
    this.load.image('tiles', 'images/tiles4.png');
    this.load.image('menu', 'images/menu.png');
    this.load.image('dead', 'images/dead.png');
    this.load.spritesheet('sound', 'images/sound.png', { frameWidth: 28, frameHeight: 22 });
    this.load.spritesheet('player', 'images/player.png', { frameWidth: 40, frameHeight: 40 });
    this.load.image('enemy', 'images/enemy.png');
    //game.load.image('bullet', 'images/bullet2.png');
    this.load.image('key', 'images/key.png');
    this.load.image('door', 'images/door.png');
    this.load.image('heart', 'images/heart.png');
    this.load.audio('music', 'sounds/music.wav');
    this.load.audio('key', 'sounds/key.wav');
    this.load.audio('heart', 'sounds/heart.wav');
    this.load.audio('dead', 'sounds/dead.wav');
  }
  create = () => {
    this.scene.start("TheeHeartsPlayScene");
  }
}

type PlayerType = Phaser.GameObjects.Sprite & { direction?: number }

export class TheeHeartsPlay extends Phaser.Scene {
  player!: PlayerType;
  cursor

  music: Phaser.Sound.BaseSound;
  key_s: Phaser.Sound.BaseSound;
  heart_s: Phaser.Sound.BaseSound;
  dead_s: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'TheeHeartsPlayScene' });
  }

  create = () => {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.cursor = this.game.input.keyboard.createCursorKeys();
    //var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //space_key.onDown.add(this.fire, this); 
    this.load_map();
    this.player = this.createPlayer();
    game.physics.arcade.enable(this.player);

    //this.bullets = game.add.group();
    //this.bullets.createMultiple(20, 'bullet');  
    this.music = this.sound.add('music', { volume: 0.4 });
    this.music.play();
    this.key_s = this.sound.add('key', { volume: 0.3 });
    this.heart_s = this.sound.add('heart', { volume: 0.3 });
    this.dead_s = this.sound.add('dead', { volume: 0.2 });

    this.tween = false;
    this.camera = {
      x: 0,
      y: 0
    };
    this.number_hearts = 0;
    this.dead = this.game.add.sprite(0, 0, 'dead');
    this.dead.alpha = 0;
  }

  createPlayer = () => {
    const player: PlayerType = this.add.sprite(w / 2, 80, 'player');
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

    return player;
  }

  update = () =>  {
    game.physics.arcade.collide(this.player, this.layer);
    game.physics.arcade.collide(this.player, this.doors, this.touched_door, null, this);
    //game.physics.arcade.overlap(this.bullets, this.layer, this.kill_bullet, null, this);
    game.physics.arcade.overlap(this.player, this.keys, this.take_key, null, this);
    game.physics.arcade.overlap(this.player, this.hearts, this.take_heart, null, this);
    game.physics.arcade.overlap(this.player, this.enemies, this.player_dead, null, this);
    game.physics.arcade.overlap(this.enemies, this.walls, this.enemy_wall, null, this);
    this.player_movements();
    this.camera_movements();
  }


  enemy_wall = (enemy, wall) => {
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

  player_dead = () => {
    if (!this.player.alive)
      return;
    if (this.sound) this.dead_s.play();
    this.player.alive = false;
    var t = game.add.tween(this.dead).to({
      alpha: 1
    }, 100).start();
    t.onComplete.add(function() {
      this.player.reset(w / 2, 80);
      game.camera.reset(0, 0);
      this.camera = {
        x: 0,
        y: 0
      };
      game.add.tween(this.dead).to({
        alpha: 0
      }, 1200).start();
      this.player.alive = true;
    }, this);
  }

  touched_door = () => {
    if (this.player.body.touching.down)
      this.player.y -= 1;
    else if (this.player.body.touching.up)
      this.player.y += 1;
    else if (this.player.body.touching.left)
      this.player.x += 1;
    else if (this.player.body.touching.right)
      this.player.x -= 1;
  }

  take_key = (player, key) => {
    this.open_door(key.key_id);
    if (sound) this.key_s.play();
    key.kill();
  }

  open_door = (id) =>  {
    this.doors.forEach(function(d) {
      if (d.key_id == id) {
        var t = game.add.tween(d.scale).to({
          x: 0,
          y: 0
        }, 300).start();
        t.onComplete.add(function() {
          this.kill()
        }, d);
      }
    }, this);
  }

  take_heart = (player, heart) => {
    if (!heart.alive)
      return;
    heart.alive = false;
    game.add.tween(heart.scale).to({
      x: 2,
      y: 2
    }, 200).start();
    game.add.tween(heart).to({
      alpha: 0
    }, 300).start();
    var t = game.add.tween(heart).delay(2200).start();
    t.onComplete.add(function() {
      this.music.resume();
      this.music.volume = 0;
      game.add.tween(this.music).to({
        volume: 0.4
      }, 1000).start();
    }, this);
    this.music.pause();
    if (sound) this.heart_s.play();
    this.number_hearts += 1;
    if (this.number_hearts == 3)
      this.game_finished();
  }

  camera_movements = () =>  {
    if (this.tween)
      return;
    this.tween = true;
    var speed = 600;
    var to_move = false;
    if (this.player.y > game.camera.y + h) {
      this.camera.y += 1;
      to_move = true;
    } else if (this.player.y < game.camera.y) {
      this.camera.y -= 1;
      to_move = true;
    } else if (this.player.x > game.camera.x + w) {
      this.camera.x += 1;
      to_move = true;
    } else if (this.player.x < game.camera.x) {
      this.camera.x -= 1;
      to_move = true;
    }
    if (to_move) {
      var t = game.add.tween(game.camera).to({
        x: this.camera.x * w,
        y: this.camera.y * h
      }, speed);
      t.start();
      t.onComplete.add(function() {
        this.tween = false;
      }, this);
    } else
      this.tween = false;
  }

  player_movements = () => {
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    if (!this.player.alive)
      return;
    var speed = 230;
    if (this.cursor.left.isDown) {
      if (this.tween) this.player.body.velocity.x = -50;
      else this.player.body.velocity.x = -speed;
      this.player.direction = 4;
      this.player.animations.play('left');
    } else if (this.cursor.right.isDown) {
      if (this.tween) this.player.body.velocity.x = 50;
      else this.player.body.velocity.x = speed;
      this.player.direction = 3;
      this.player.animations.play('right');
    } else if (this.cursor.up.isDown) {
      if (this.tween) this.player.body.velocity.y = -50;
      else this.player.body.velocity.y = -speed;
      this.player.direction = 1;
      this.player.animations.play('up');
    } else if (this.cursor.down.isDown) {
      if (this.tween) this.player.body.velocity.y = 50;
      else this.player.body.velocity.y = speed;
      this.player.direction = 2;
      this.player.animations.play('down');
    } else {
      if (this.player.direction == 1)
        this.player.frame = 3;
      else if (this.player.direction == 2)
        this.player.frame = 0;
      else if (this.player.direction == 3)
        this.player.frame = 6;
      else if (this.player.direction == 4)
        this.player.frame = 9;
      this.player.animations.stop();
    }
  }

  load_map = () => {
    this.map = game.add.tilemap('map1');
    this.map.addTilesetImage('tiles');
    this.layer = this.map.createLayer('tiles');
    this.map.setCollisionBetween(1, 6);
    this.layer.resizeWorld();
    this.enemies = game.add.group();
    this.keys = game.add.group();
    this.doors = game.add.group();
    this.hearts = game.add.group();
    this.walls = game.add.group();
    this.map.createFromObjects('objects', 16, 'enemy', 0, true, false, this.enemies);
    this.map.createFromObjects('objects', 24, 'key', 0, true, false, this.keys);
    this.map.createFromObjects('objects', 25, 'door', 0, true, false, this.doors);
    this.map.createFromObjects('objects', 22, '', 0, true, false, this.walls);
    this.map.createFromObjects('objects', 23, 'heart', 0, true, false, this.hearts);
    this.keys.forEach(function(d) {
      game.physics.arcade.enable(d);
    }, this);
    this.enemies.forEach(function(e) {
      game.physics.arcade.enable(e);
      if (e.move == 1)
        e.body.velocity.x = 200;
      else
        e.body.velocity.y = 200;
    }, this);
    this.walls.forEach(function(e) {
      game.physics.arcade.enable(e);
    }, this);
    this.hearts.forEach(function(h) {
      game.physics.arcade.enable(h);
      h.anchor.setTo(0.5, 0.5);
      h.x += h.width / 2;
      h.y += h.height / 2;
      h.alive = true;
    }, this);
    this.doors.forEach(function(d) {
      game.physics.arcade.enable(d);
      d.body.immovable = true;
      d.anchor.setTo(0.5, 0.5);
      d.x += d.width / 2;
      d.y += d.height / 2;
    }, this);
  }

  game_finished = () =>  {
    this.open_door(4);
    var style = {
      font: '25px Arial',
      fill: '#fff',
      align: 'center'
    };
    var label = game.add.text(this.camera.x * w + w / 2, this.camera.y * h + h / 2, 'congratulation!\nnow go to the South-East', style);
    label.anchor.setTo(0.5, 0.5);
    label.scale.setTo(0, 0);
    game.add.tween(label.scale).to({
      x: 1,
      y: 1
    }, 1500, Phaser.Easing.Bounce.Out).start();
    var p = game.add.emitter(3.5 * w, 4 * h, 200);
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