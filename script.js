// Define the size of our canvas and the size of each cell in our map
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
// const cellSize = 64;

// Define the map data as a 2D array of numbers, where each number represents a different type of cell
const mapData = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 1],
  [1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

// Get a reference to the canvas and create a 2D rendering context
const canvas = document.createElement('canvas');

// Set the canvas dimensions
canvas.setAttribute('width', screenWidth);
canvas.setAttribute('height', screenHeight);
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const TICK = 30;

const CELL_SIZE = 64;

const PLAYER_SIZE = 10;

const player = {
  x: CELL_SIZE * 1.5,
  y: CELL_SIZE * 2,
  angle: 0,
  speed: 0,
}

function clearScreen() {
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, screenWidth, screenHeight);
}

function movePlayer() { }

function getRays() {
  return []
}

function renderScene(rays) { }

function renderMinimap(posX = 0, posY = 0, scale = 1, rays) {
  const cellSize = scale * CELL_SIZE;
  mapData.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        ctx.fillStyle = 'grey'
        ctx.fillRect(
          posX + x * cellSize,
          posY + y * cellSize,
          cellSize,
          cellSize,
        );
      };
    });
  });

  ctx.fillStyle = 'blue';
  ctx.fillRect(
    posX + player.x * scale - PLAYER_SIZE/2,
    posY + player.y * scale - PLAYER_SIZE/2,
    PLAYER_SIZE,
    PLAYER_SIZE,
  )

  const rayLength = PLAYER_SIZE * 2;
  ctx.strokeStyle = 'blue';
  ctx.begintPath();
  ctx.moveTo(player.x * scale + posX, player.y * scale + posY)
  ctx.lineTo(
    (player.x + Math.cos(player.angle) * rayLength) *  scale,
    (player.y + Math.sin(player.angle) * rayLength) *  scale,
  )
  ctx.closePath();
  ctx.stroke();
};

function gameLoop() {
  clearScreen()
  movePlayer()
  const rays = getRays()
  renderScene(rays)
  renderMinimap(0, 0, 0.75, rays)
}

setInterval(gameLoop, TICK)
