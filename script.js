const boardSize = 5;
const totalTraps = 3;
let treasurePos, traps, gameOver, lastSelectedTile, chances, score, hintLimit;

function initGame() {
    gameOver = false;
    lastSelectedTile = null;
    chances = 0;  // Initialize chances to 0
    score = 250;  // Initialize score to 250
    hintLimit = 3;  // Initialize hint limit
    document.getElementById('message').textContent = "Find the treasure! You have 3 chances.";
    document.getElementById('scoreBoard').textContent = `Score: ${score}`; // Display initial score
    document.getElementById('hintBox').textContent = ""; // Clear hint box

    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Create grid tiles with numbers 1 to 25
    for (let i = 0; i < boardSize * boardSize; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.index = i;
        tile.textContent = i + 1;  // Set the tile number
        tile.addEventListener('click', () => handleTileClick(i));
        gameBoard.appendChild(tile);
    }
    
    // Set random position for treasure
    treasurePos = Math.floor(Math.random() * boardSize * boardSize);
    
    // Set random positions for traps
    traps = [];
    while (traps.length < totalTraps) {
        const trapPos = Math.floor(Math.random() * boardSize * boardSize);
        if (trapPos !== treasurePos && !traps.includes(trapPos)) {
            traps.push(trapPos);
        }
    }
}

function handleTileClick(index) {
    if (gameOver) return;  // Prevent further actions after the game is over
    const tile = document.querySelector(`.tile[data-index="${index}"]`);
    
    // Check if this is the first tile selection or valid next move
    if (lastSelectedTile !== null && !isValidMove(index)) {
        document.getElementById('message').textContent = "Invalid move! Select a surrounding tile.";
        return;
    }

    // Check for treasure
    if (index === treasurePos) {
        tile.innerHTML = `<img src="https://i.postimg.cc/KjzDRdrG/treasure-removebg-preview.png" alt="Treasure" style="width:100%; height:100%;">`; // Set treasure image
        document.getElementById('message').textContent = "Congratulations! You found the treasure!";
        gameOver = true;  // End the game once the treasure is found
        return;
    }
    // Check for traps
    else if (traps.includes(index)) {
        tile.innerHTML = `<img src="https://i.postimg.cc/ydnT6VRp/skull-removebg-preview.png" alt="Trap" style="width:100%; height:100%;">`; // Set trap image
        chances++;  // Increase the chances used
        score -= 15;  // Decrease score by 15 for selecting a trap
        document.getElementById('message').textContent = `You hit a trap! You have ${3 - chances} chances left.`;
        document.getElementById('hintBox').textContent = ""; // Clear hint box
    }
    // Empty tile - Change to neutral image
    else {
        tile.innerHTML = `<img src="https://i.postimg.cc/RFvRz3Wn/foot-removebg-preview.png" alt="Empty" style="width:100%; height:100%;">`; // Set empty grid image
        score -= 5;  // Decrease score by 5 for selecting a grid
        lastSelectedTile = index;  // Update the last selected tile
    }

    // Update the score
    document.getElementById('scoreBoard').textContent = `Score: ${score}`;

    // Check if score reaches 0
    if (score <= 0) {
        document.getElementById('message').textContent = "Game Over! Your score reached 0.";
        gameOver = true;  // End the game if score reaches 0
    }

    // Check if chances reach 3
    if (chances >= 3) {
        document.getElementById('message').textContent = "Game Over! You selected 3 traps.";
        gameOver = true;  // End the game if 3 traps are selected
    }
}

// Provide hints based on proximity to the treasure
function giveHint() {
    if (hintLimit <= 0) {
        document.getElementById('hintBox').textContent = "No hints left!";
        return;
    }

    if (lastSelectedTile === null) {
        document.getElementById('hintBox').textContent = "Please select at least one grid to get a hint!";
        return;
    }

    const surroundingIndices = getSurroundingIndices(lastSelectedTile);
    const distanceHints = surroundingIndices.map(index => {
        const distance = Math.abs(Math.floor(index / boardSize) - Math.floor(treasurePos / boardSize)) + Math.abs(index % boardSize - treasurePos % boardSize);
        return { index: index + 1, distance }; // Store distance with grid number (1-25)
    });

    // Filter out the distances and sort them
    const closestTiles = distanceHints.filter(hint => hint.distance > 0).sort((a, b) => a.distance - b.distance).slice(0, 2);

    // Generate hint messages
    const hints = closestTiles.map(hint => `Tile ${hint.index} is close to the treasure.`).join(' ');
    document.getElementById('hintBox').textContent = hints; // Update hint box
    hintLimit--;  // Decrease the hint limit after providing a hint
}

// Get surrounding indices of the last selected tile
function getSurroundingIndices(index) {
    const surroundingIndices = [];
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skip the center tile
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                surroundingIndices.push(newRow * boardSize + newCol); // Calculate new index
            }
        }
    }
    return surroundingIndices;
}

// Validate if the clicked tile is surrounding the last selected tile
function isValidMove(index) {
    const lastRow = Math.floor(lastSelectedTile / boardSize);
    const lastCol = lastSelectedTile % boardSize;

    const newRow = Math.floor(index / boardSize);
    const newCol = index % boardSize;

    // Check if the new tile is adjacent (horizontally, vertically, or diagonally)
    return Math.abs(lastRow - newRow) <= 1 && Math.abs(lastCol - newCol) <= 1;
}

// Initialize game on page load
window.onload = initGame;

// Add a function to allow players to request hints
function requestHint() {
    giveHint();
}

// Add a button to request hints
document.getElementById('hintButton').addEventListener('click', requestHint);
