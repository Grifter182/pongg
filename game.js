const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const hitSound = document.getElementById('hitSound');
const scoreSound = document.getElementById('scoreSound');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const paddleWidth = 12;
const paddleHeight = 80;
const paddleSpeed = 7;

// Ball settings
const ballSize = 14;

// Game objects
let player = {
  x: 0,
  y: HEIGHT / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  score: 0
};
let ai = {
  x: WIDTH - paddleWidth,
  y: HEIGHT / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  score: 0
};
let ball = {
  x: WIDTH / 2 - ballSize / 2,
  y: HEIGHT / 2 - ballSize / 2,
  size: ballSize,
  speed: 5,
  dx: Math.random() > 0.5 ? 5 : -5,
  dy: (Math.random() - 0.5) * 6
};

// Helper for resetting the ball after a score
function resetBall(direction = 1) {
  ball.x = WIDTH / 2 - ballSize / 2;
  ball.y = HEIGHT / 2 - ballSize / 2;
  ball.dx = direction * ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = (Math.random() - 0.5) * 6;
}

// Draw paddles
function drawPaddle(p) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(p.x, p.y, p.width, p.height);
}

// Draw ball
function drawBall() {
  ctx.fillStyle = "#ffea00";
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
}

// Draw net
function drawNet() {
  ctx.strokeStyle = "#444";
  ctx.beginPath();
  for (let i = 0; i < HEIGHT; i += 20) {
    ctx.moveTo(WIDTH / 2, i);
    ctx.lineTo(WIDTH / 2, i + 10);
  }
  ctx.stroke();
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawNet();
  drawPaddle(player);
  drawPaddle(ai);
  drawBall();
}

// Update game state
function update() {
  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with top/bottom
  if (ball.y <= 0 || ball.y + ball.size >= HEIGHT) {
    ball.dy = -ball.dy;
    hitSound.currentTime = 0; hitSound.play();
  }

  // Ball collision with player paddle
  if (
    ball.x <= player.x + player.width &&
    ball.y + ball.size >= player.y &&
    ball.y <= player.y + player.height
  ) {
    ball.x = player.x + player.width; // Prevent sticking
    ball.dx = -ball.dx;
    // Add some "english"
    let collidePoint = (ball.y + ball.size/2) - (player.y + player.height/2);
    ball.dy = collidePoint * 0.20;
    hitSound.currentTime = 0; hitSound.play();
  }

  // Ball collision with ai paddle
  if (
    ball.x + ball.size >= ai.x &&
    ball.y + ball.size >= ai.y &&
    ball.y <= ai.y + ai.height
  ) {
    ball.x = ai.x - ball.size; // Prevent sticking
    ball.dx = -ball.dx;
    // Add some "english"
    let collidePoint = (ball.y + ball.size/2) - (ai.y + ai.height/2);
    ball.dy = collidePoint * 0.20;
    hitSound.currentTime = 0; hitSound.play();
  }

  // Score for AI
  if (ball.x < 0) {
    ai.score++;
    updateScoreDisplay();
    scoreSound.currentTime = 0; scoreSound.play();
    resetBall(1);
  }
  // Score for player
  if (ball.x + ball.size > WIDTH) {
    player.score++;
    updateScoreDisplay();
    scoreSound.currentTime = 0; scoreSound.play();
    resetBall(-1);
  }

  // AI movement (simple follow)
  let aiCenter = ai.y + ai.height / 2;
  if (aiCenter < ball.y) {
    ai.y += paddleSpeed * 0.7;
  } else if (aiCenter > ball.y + ball.size) {
    ai.y -= paddleSpeed * 0.7;
  }
  // Clamp AI within bounds
  if (ai.y < 0) ai.y = 0;
  if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}

function updateScoreDisplay() {
  document.getElementById('playerScore').textContent = player.score;
  document.getElementById('aiScore').textContent = ai.score;
}

// Player paddle control (mouse/touch)
function setPlayerPaddle(y) {
  player.y = y - player.height / 2;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
}

// Mouse control
canvas.addEventListener('mousemove', function(e) {
  let rect = canvas.getBoundingClientRect();
  let scale = HEIGHT / rect.height;
  setPlayerPaddle((e.clientY - rect.top) * scale);
});

// Touch control for mobile
canvas.addEventListener('touchmove', function(e) {
  e.preventDefault();
  if (e.touches.length > 0) {
    let rect = canvas.getBoundingClientRect();
    let scale = HEIGHT / rect.height;
    setPlayerPaddle((e.touches[0].clientY - rect.top) * scale);
  }
}, { passive: false });

// Prevent scrolling on mobile while playing
canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
canvas.addEventListener('touchend', e => e.preventDefault(), { passive: false });

// Main game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Initialize
updateScoreDisplay();
loop();
