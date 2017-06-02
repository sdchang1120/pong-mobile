// VARIABLES
var playerOne, playerTwo, ball, keyState,
canvas = document.querySelector('#canvas'),
context = canvas.getContext('2d'),
playBtn = document.querySelector('#play-btn'),
playerOneScore = document.querySelector('#playerOneScore'),
playerTwoScore = document.querySelector('#playerTwoScore'),
volumeOnBtn = document.querySelector('#volume-on'),
volumeOffBtn = document.querySelector('#volume-off'),
hitSound = document.querySelector('#hit-sound'),
failureSound = document.querySelector('#failure-sound');

// OBJECTS
playerOne = {
  x: 0,
  y: 0,
  width: 10,
  height: 75,
  score: 0,
  update: function() {
    if (keyState[87]) { // w key
      this.y -= 5
    };
    if (keyState[83]) { // s key
      this.y += 5
    };
  },
  draw: function() {
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}
playerTwo = {
  x: 0,
  y: 0,
  width: 10,
  height: 75,
  score: 0,
  update: function() {
    if (keyState[38]) { // down arrow
      this.y -= 5
    };
    if (keyState[40]) { // up arrow
      this.y += 5
    };
  },
  draw: function() {
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}
ball = {
  x: 0,
  y: 0,
  side: 10,
  vel: null,
  speed: 3,
  radius: 5,
  update: function() {

    // update ball position with velocity
    this.x += this.vel.x;
    this.y += this.vel.y;

    // if ball goes beyond canvas in y-direction
    if (0 > this.y || this.y+this.side > canvas.height) {

      // calculate in the offset on both ends of canvas
      var offset = this.vel.y < 0 ? 0 - this.y : canvas.height - (this.y+this.side);
      this.y += 2*offset;

      hitSound.play();
      this.vel.y *= -1; // reverse the direction of ball
    }

    // if ball is moving to right
    if (this.vel.x > 0) {

      // if ball hits player 2's paddle
      if (playerTwo.x < this.x + this.side &&
      playerTwo.y < this.y + this.side &&
      this.x < playerTwo.x + playerTwo.width &&
      this.y < playerTwo.y + playerTwo.height) {

        // calculating deflections TODO: need to improve calculation
        var yoffset = Math.abs(this.y - playerTwo.y);
        if (yoffset < (playerTwo.height * .4)) {
          this.vel.y -= 1;
        } else if (yoffset >= (playerTwo.height * .6)) {
          this.vel.y += 1;
        }

        hitSound.play();
        this.vel.x *= -1; // reverse direction of ball
      }

      // if ball hits right wall
      if (this.x > playerTwo.x) {
        failureSound.play();
        playerOne.score += 1; // player 1 scores a point
        init(); // restart game
      }
    }

    // if ball is moving to left
    if (this.vel.x < 0) {

      // if ball hits player 1's paddle
      if (playerOne.x < this.x + this.side &&
      playerOne.y < this.y + this.side &&
      this.x < playerOne.x + playerOne.width &&
      this.y < playerOne.y + playerOne.height) {

        // calculating deflections TODO: need to improve calculation
        var yoffset = Math.abs(this.y - playerOne.y);
        if (yoffset < (playerOne.height * .4)) {
          this.vel.y -= 1;
        } else if (yoffset >= (playerOne.height * .6)) {
          this.vel.y += 1;
        }

        hitSound.play();
        this.vel.x *= -1; // reverse direction of ball
      }

      // if ball hits left wall
      if (this.x <= playerOne.x) {
        failureSound.play();
        playerTwo.score += 1; // player 2 scores a point
        init(); // restart game
      }
    }

  },
  draw: function() {
    context.beginPath();
    context.arc(this.x+5, this.y+5, this.radius, 0, 2*Math.PI, false); // gives ball its round shape
    context.fillStyle = 'red';
    context.fill();
    context.closePath();
  }
}

// TOUCH EVENT LISTENER
function touchEvent(event) {
  if (event.touches.length === 0) return;
  event.preventDefault();
  event.stopPropagation();
  var touch = event.touches[0];

  // if user touches anywhere on the left half of the canvas (player 1's field),
  // player 1 can move the paddle
  if (touch.clientX <= canvas.width/2 - 15) {
    playerOne.y = (touch.pageY - playerOne.height / 2);
  }

  // if user touches anywhere on the right half of the canvas (player 2's field),
  // player 2 can move the paddle
  if (touch.clientX >= canvas.width/2 + 15) {
    playerTwo.y = (touch.pageY - playerTwo.height / 2);
  }
}

// SETUP
function main() {
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
  document.body.appendChild(canvas);

  keyState = {}; // TODO: Use touchstart, touchmove, touchend event listeners
  document.addEventListener('keydown', function(event) {
    keyState[event.keyCode] = true;
  });
  document.addEventListener('keyup', function(event) {
    delete keyState[event.keyCode];
  });

  document.addEventListener('touchstart', touchEvent, true);
  document.addEventListener('touchmove', touchEvent, true);
  document.addEventListener('touchend', touchEvent, true);
  document.addEventListener('touchcancel', touchEvent, true);

  init(); // initiate game

  var loop = function() {
    update();
    draw();
    window.requestAnimationFrame(loop, canvas);
  }
  window.requestAnimationFrame(loop, canvas);
}

// INITIALIZE OBJS
function init() {
  playerOne.x = playerOne.width;
  playerOne.y = (canvas.height - playerOne.height)/2;

  playerTwo.x = canvas.width - (playerOne.width + playerTwo.width);
  playerTwo.y = (canvas.height - playerTwo.height)/2;

  ball.x = (canvas.width - ball.side)/2;
  ball.y = (canvas.height - ball.side)/2;

  ball.vel = {
    x: ball.speed,
    y: 0
  }

  playerOneScore.innerHTML = 'PLAYER 1: ' + playerOne.score;
  playerTwoScore.innerHTML = 'PLAYER 2: ' + playerTwo.score;
}

// UPDATE OBJS
function update() {
  playerOne.update();
  playerTwo.update();
  ball.update();
}

// DRAW OBJS
function draw() {
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.fillStyle = "white";
  playerOne.draw();
  playerTwo.draw();
  ball.draw();
  context.restore();
}

// VOLUME ON EVENT LISTENER
volumeOnBtn.addEventListener('click', function() {
  hitSound.muted = true; // turn sound fx off
  failureSound.muted = true; // turn sound fx off
  volumeOnBtn.style.display = "none"; // hide volume on icon
  volumeOffBtn.style.display = "block"; // display volume off icon
});

// VOLUME OFF EVENT LISTENER
volumeOffBtn.addEventListener('click', function() {
  hitSound.muted = false; // turn sound fx off
  failureSound.muted = false; // turn sound fx off
  volumeOffBtn.style.display = "none"; // hide volume off icon
  volumeOnBtn.style.display = "block"; // display volume on icon
});

// PLAY BTN TO START GAME
playBtn.addEventListener('click', function() {
  welcome.remove();
  main();
});
