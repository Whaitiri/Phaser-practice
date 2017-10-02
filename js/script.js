var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var platforms;
var	player;
var cursors;
var stats;
var score = 0;
var scoreText;
var jumpTimer = 0;
var jumpedTwice = false;

function preload() {
	game.load.image('sky', 'assets/sky.png');
	game.load.image('star', 'assets/star.png');
	game.load.image('ground', 'assets/platform.png');
	game.load.spritesheet('dude', 'assets/dude.png', 32, 48)
}

function create() {
	game.add.sprite(0, 0, 'star');

	//physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	game.add.sprite(0, 0, 'sky');


	platforms = game.add.group();
	platforms.enableBody = true;
	var ground = platforms.create(0, game.world.height - 64, 'ground');
	ground.scale.setTo(2, 2);
	ground.body.immovable = true;
	var ledge = platforms.create(400, 440, 'ground');
	ledge.body.immovable = true;
	ledge = platforms.create(-100, 380, 'ground');
	ledge.body.immovable = true;

	//the player
	player = game.add.sprite(32, game.world.height - 150, 'dude');

	game.physics.arcade.enable(player);

	//physics properties

	player.body.bounce.y = 0.08;
	player.body.gravity.y = 2000;
	player.body.collideWorldBounds = true;

	//animations
	player.animations.add('left', [0, 1, 2, 3], 10, true);
	player.animations.add('right', [5, 6, 7, 8], 10, true);

	//controls
	cursors = game.input.keyboard.createCursorKeys();

	//stars 
	stars = game.add.group();

	stars.enableBody = true;


	for (var i = 0; i < 12; i++) {
		var star = stars.create(i * 70, 0, 'star');

		// Let gravity do its thing
		star.body.gravity.y = 600;

		star.body.bounce.y = 0.6 + Math.random() * 0.2;
		star.body.collideWorldBounds = true;
	}

	//score text
	scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

function update() {
	//player collision with platforms
	var hitPlatform = game.physics.arcade.collide(player, platforms);

	//star collision with platforms

	var starPlatform = game.physics.arcade.collide(stars, platforms);

	//player star overlap 
	game.physics.arcade.overlap(player, stars, collectStar, null, this);

	function collectStar (player, star) {
		star.kill();
		score = score + 1;
		scoreText.text = 'Score: ' + score;
	}
	//key presses
	player.body.velocity.x = 0;

	if (cursors.left.isDown) {
		player.body.velocity.x = -150;
		player.animations.play('left');
	} else if (cursors.right.isDown) {
		player.body.velocity.x = 150;
		player.animations.play('right');
	} else if (cursors.down.isDown) {
		player.frame = 4;
	} else {
		player.animations.stop();
		if (player.frame < 4) {
			player.frame = 0;
		} else if (player.frame > 4) {
			player.frame = 5;
		}
	}


	if (cursors.up.downDuration(50) && player.body.touching.down && !jumpedTwice) {
		player.body.velocity.y = -650;
		if (cursors.up.downDuration(1000)) {
			player.body.velocity.y = -1000;
		}
	}
}