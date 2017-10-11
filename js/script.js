var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var	player;
var cursors;
var stats;
var score = 0;
var scoreText;
var jumpTimer = 0;
var jumpedTwice = false;
var gravityText;
var velocityText;
var inAir = false;
var inAirText;
var isMoving = false;
var layer;
var map;
var globalGravity = 150;


function preload() {
	game.load.image('sky', 'assets/sky.png');
	game.load.image('star', 'assets/star.png');
	game.load.image('ground', 'assets/platform.png');
	game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
	game.load.image('ground_1x1', 'assets/ground_1x1.png');
    game.load.image('walls_1x2', 'assets/walls_1x2.png');
    game.load.image('tiles2', 'assets/tiles2.png');
	game.load.tilemap('map', 'assets/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
}

function create() {
	game.add.sprite(0, 0, 'star');
	game.add.sprite(0, 0, 'sky');

	//game physics

	game.physics.startSystem(Phaser.Physics.P2JS);

	game.physics.p2.gravity.y = globalGravity;
	game.physics.p2.world.defaultContactMaterial.friction = 0;
	// game.physics.p2.world.setGlobalSitffness(1e5);


	//tilemap
	map = game.add.tilemap('map');

	map.addTilesetImage('ground_1x1');
	map.addTilesetImage('walls_1x2');
	map.addTilesetImage('tiles2');

	layer = map.createLayer('Tile Layer 1');

	layer.resizeWorld();

	//set the tiles for collision
	//do before generating p2 bodies

	map.setCollisionBetween(1, 12);

	//  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
    //  This call returns an array of body objects which you can perform addition actions on if
    //  required. There is also a parameter to control optimising the map build.
    game.physics.p2.convertTilemap(map, layer);

    game.physics.p2.restitution = 0.18;
    game.physics.p2.gravity.y = 2000;

	//the player
	player = game.add.sprite(64, game.world.height - 150, 'dude');


	//physics properties
	game.physics.p2.enable(player);
	player.body.fixedRotation = true;
	game.camera.follow(player);
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
		game.physics.p2.enable(star);
		star.body.mass = 1;
		star.body.bounce = 0.3 + Math.random() * 0.2;
	}

	//score text
	scoreText = game.add.text(16, 26, 'score: 0', { fontSize: '26px', fill: '#000' });
	gravityText = game.add.text(16, 0, 'gravity', { fontSize: '26px', fill: '#000' });
	velocityText = game.add.text(16, 52, 'velocity', { fontSize: '26px', fill: '#000' });
	inAirText = game.add.text(500, 52, 'inAir', { fontSize: '26px', fill: '#000' });
}
function update() {
	

	function collectStar (player, star) {
		star.kill();
		score = score + 1;
		scoreText.text = 'Score: ' + score;
	}

	gravityText.text = "gravity: " + player.body.gravity.y;
	velocityText.text = "velocity: " + player.body.velocity.x;
	inAirText.text = "jumptimer" + jumpTimer;

	//key presses
	player.body.velocity.x = 0;

	if (cursors.left.isDown) {
		player.body.velocity.x = -150;
		player.animations.play('left');
		isMoving = true;
	} else if (cursors.right.isDown) {
		player.body.velocity.x = 150;
		player.animations.play('right');
		isMoving = true;
	} else if (cursors.down.isDown) {
		player.frame = 4;
		isMoving = false;
	} else {

		player.animations.stop();
		player.body.velocity.x = 0;
		if (player.frame < 4) {
			player.frame = 0;
		} else if (player.frame > 4) {
			player.frame = 5;
		}
		isMoving = false;
	}

	if (cursors.up.downDuration(1) && checkIfCanJump()) {
		player.body.velocity.y = -600;
		isMoving = true;
		inAir = true;
		jumpTimer = game.time.now;
	} else if (cursors.up.isDown && inAir && (jumpTimer != 0)) {
		if (game.time.now - jumpTimer > 90) { 
			jumpTimer = 0;
		} else {
			player.body.velocity.y = -600;
		}
	} else if (jumpTimer != 0) {
		jumpTimer = 0;
		player.body.gravity.y = globalGravity;
	}

	// while (cursors.up.isDown && inAir) {
	// 	player.body.gravity.y = 1000;
	// }
}

function checkIfCanJump() {

    var yAxis = p2.vec2.fromValues(0, 1);
    var result = false;

    for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++)
    {
        var c = game.physics.p2.world.narrowphase.contactEquations[i];

        if (c.bodyA === player.body.data || c.bodyB === player.body.data)
        {
            var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
            if (c.bodyA === player.body.data) d *= -1;
            if (d > 0.5) result = true;
        }
    }
    
    return result;

}