const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.75;
    const aspectRatio = 2;
    
    if (maxWidth / maxHeight > aspectRatio) {
        canvas.width = maxHeight * aspectRatio;
        canvas.height = maxHeight;
    } else {
        canvas.width = maxWidth;
        canvas.height = maxWidth / aspectRatio;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game objects
const paddle = {
    width: canvas.width * 0.02,
    height: canvas.height * 0.25,
    speed: canvas.height * 0.008,
    x: canvas.width * 0.02,
};

const ball = {
    size: canvas.width * 0.015,
    x: canvas.width / 2,
    y: canvas.height / 2,
    speedX: canvas.width * 0.005,
    speedY: canvas.height * 0.005,
    maxSpeed: canvas.width * 0.01,
};

let playerY = canvas.height / 2 - paddle.height / 2;
let computerY = canvas.height / 2 - paddle.height / 2;
let playerScore = 0;
let computerScore = 0;

// Touch and mouse controls
let mouseY = canvas.height / 2;

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.touches[0].clientY - rect.top;
}, { passive: false });

// Game update
function update() {
    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with top and bottom
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.speedY = -ball.speedY;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Move player paddle
    playerY = mouseY - paddle.height / 2;
    playerY = Math.max(0, Math.min(canvas.height - paddle.height, playerY));

    // Computer AI
    const computerCenter = computerY + paddle.height / 2;
    if (computerCenter < ball.y - 35) {
        computerY += paddle.speed;
    } else if (computerCenter > ball.y + 35) {
        computerY -= paddle.speed;
    }
    computerY = Math.max(0, Math.min(canvas.height - paddle.height, computerY));

    // Ball collision with paddles
    // Player paddle
    if (
        ball.x - ball.size < paddle.x + paddle.width &&
        ball.y > playerY &&
        ball.y < playerY + paddle.height
    ) {
        ball.speedX = -ball.speedX;
        ball.x = paddle.x + paddle.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (playerY + paddle.height / 2)) / (paddle.height / 2);
        ball.speedY += hitPos * ball.maxSpeed * 0.3;
    }

    // Computer paddle
    if (
        ball.x + ball.size > canvas.width - paddle.x - paddle.width &&
        ball.y > computerY &&
        ball.y < computerY + paddle.height
    ) {
        ball.speedX = -ball.speedX;
        ball.x = canvas.width - paddle.x - paddle.width - ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computerY + paddle.height / 2)) / (paddle.height / 2);
        ball.speedY += hitPos * ball.maxSpeed * 0.3;
    }

    // Limit ball speed
    const maxSpeed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
    if (maxSpeed > ball.maxSpeed * 2) {
        ball.speedX = (ball.speedX / maxSpeed) * ball.maxSpeed * 2;
        ball.speedY = (ball.speedY / maxSpeed) * ball.maxSpeed * 2;
    }

    // Ball out of bounds
    if (ball.x < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    } else if (ball.x > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * canvas.width * 0.005;
    ball.speedY = (Math.random() - 0.5) * canvas.height * 0.005;
}

// Draw game
function draw() {
    // Clear canvas
    context.fillStyle = '#0a0e27';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    context.strokeStyle = '#10b981';
    context.setLineDash([10, 10]);
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();
    context.setLineDash([]);

    // Draw paddles
    context.fillStyle = '#10b981';
    context.fillRect(paddle.x, playerY, paddle.width, paddle.height);
    context.fillRect(canvas.width - paddle.x - paddle.width, computerY, paddle.width, paddle.height);

    // Draw ball
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    context.fill();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();