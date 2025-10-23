// ============================================
// WORD BANK
// ============================================
// Array of words that will fall during the game
const words = [
  "javascript",
  "python",
  "coding",
  "developer",
  "computer",
  "keyboard",
  "mouse",
  "screen",
  "program",
  "function",
  "variable",
  "array",
  "object",
  "string",
  "number",
  "boolean",
  "loop",
  "condition",
  "class",
  "method",
  "algorithm",
  "database",
  "server",
  "client",
  "network",
];

// ============================================
// GAME STATE
// ============================================
// Object that stores all game data
let gameState = {
  score: 0, // Player's current score
  lives: 1, // Number of lives (only 1 chance)
  timeLeft: 60, // Time remaining in seconds
  isPlaying: false, // Whether game is currently active
  fallingWords: [], // Array of currently falling word objects
  spawnInterval: null, // Timer for spawning new words
  timerInterval: null, // Timer for countdown
};

// ============================================
// DOM ELEMENTS
// ============================================
// Get references to all HTML elements we need to interact with
const gameArea = document.getElementById("game-area"); // Container where words fall
const wordInput = document.getElementById("word-input"); // Input field for typing
const startBtn = document.getElementById("start-btn"); // Start game button
const restartBtn = document.getElementById("restart-btn"); // Restart button in game over screen
const gameOverDiv = document.getElementById("game-over"); // Game over overlay
const scoreDisplay = document.getElementById("score"); // Score display in header
const livesDisplay = document.getElementById("lives"); // Lives display in header
const timeDisplay = document.getElementById("time"); // Timer display in header
const finalScoreDisplay = document.getElementById("final-score"); // Final score in game over screen
const resultMessage = document.getElementById("result-message"); // Victory/Game Over message
const resultIcon = document.getElementById("result-icon"); // Icon (trophy or skull)

// ============================================
// GAME INITIALIZATION
// ============================================
/**
 * Starts a new game
 * - Resets all game state values
 * - Hides start button and game over screen
 * - Enables input field
 * - Starts spawning words and countdown timer
 */
function startGame() {
  // Reset game state to initial values
  gameState = {
    score: 0,
    lives: 1,
    timeLeft: 60,
    isPlaying: true,
    fallingWords: [],
    spawnInterval: null,
    timerInterval: null,
  };

  // Update UI displays
  updateDisplay();

  // Hide/show appropriate UI elements
  startBtn.classList.add("hidden");
  gameOverDiv.classList.add("hidden");
  wordInput.disabled = false;
  wordInput.focus(); // Focus input so player can start typing immediately
  gameArea.innerHTML = ""; // Clear any existing words

  // Start game loops
  gameState.spawnInterval = setInterval(spawnWord, 1500); // Spawn new word every 1 second
  gameState.timerInterval = setInterval(updateTimer, 1000); // Update timer every 1 second
}

// ============================================
// WORD SPAWNING
// ============================================
/**
 * Creates a new falling word
 * - Picks random word from word bank
 * - Creates DOM element with random horizontal position
 * - Adds to game area and tracking array
 * - Sets up auto-removal after fall duration
 */
function spawnWord() {
  if (!gameState.isPlaying) return; // Don't spawn if game is over

  // Pick random word from the word bank
  const word = words[Math.floor(Math.random() * words.length)];

  // Create the word element
  const wordElement = document.createElement("div");
  wordElement.className = "falling-word";
  wordElement.textContent = word;

  // Position randomly on horizontal axis
  wordElement.style.left = Math.random() * (gameArea.offsetWidth - 150) + "px";

  // Set fall duration (8 seconds to fall from top to bottom)
  const fallDuration = 8;
  wordElement.style.animationDuration = fallDuration + "s";

  // Add to game area
  gameArea.appendChild(wordElement);

  // Create word object to track this word
  const wordObj = {
    element: wordElement, // Reference to DOM element
    text: word, // The actual word text
    id: Date.now(), // Unique identifier
  };

  // Add to tracking array
  gameState.fallingWords.push(wordObj);

  // Set timeout to remove word if it reaches bottom (player missed it)
  setTimeout(() => {
    if (gameState.fallingWords.includes(wordObj) && gameState.isPlaying) {
      removeWord(wordObj, true); // true = word was missed
    }
  }, fallDuration * 1000);
}

// ============================================
// WORD REMOVAL
// ============================================
/**
 * Removes a word from the game
 * @param {Object} wordObj - The word object to remove
 * @param {boolean} missed - Whether the word was missed (reached bottom) or typed correctly
 *
 * If missed = true:
 * - Decreases lives
 * - Ends game if no lives left
 */
function removeWord(wordObj, missed = false) {
  // Remove from tracking array
  const index = gameState.fallingWords.indexOf(wordObj);
  if (index > -1) {
    gameState.fallingWords.splice(index, 1);
  }

  // Remove DOM element
  if (wordObj.element && wordObj.element.parentNode) {
    wordObj.element.parentNode.removeChild(wordObj.element);
  }

  // Handle missed word
  if (missed) {
    gameState.lives--; // Lose a life
    livesDisplay.textContent = gameState.lives;

    // Game over if no lives left
    if (gameState.lives <= 0) {
      endGame(false); // false = lost by missing word
    }
  }
}

// ============================================
// TIMER MANAGEMENT
// ============================================
/**
 * Updates the countdown timer
 * - Decreases time by 1 second
 * - Updates display
 * - Ends game when time reaches 0
 */
function updateTimer() {
  gameState.timeLeft--;
  timeDisplay.textContent = gameState.timeLeft;

  // Time's up - player wins if they still have lives
  if (gameState.timeLeft <= 0) {
    endGame(true); // true = time ran out (victory condition)
  }
}

// ============================================
// DISPLAY UPDATE
// ============================================
/**
 * Updates all UI displays with current game state values
 */
function updateDisplay() {
  scoreDisplay.textContent = gameState.score;
  livesDisplay.textContent = gameState.lives;
  timeDisplay.textContent = gameState.timeLeft;
}

// ============================================
// GAME END
// ============================================
/**
 * Ends the game and shows results
 * @param {boolean} timeUp - Whether game ended due to time running out (win) or losing all lives (lose)
 *
 * - Stops all game loops
 * - Clears all falling words
 * - Shows game over screen with appropriate message
 */
function endGame(timeUp) {
  gameState.isPlaying = false;

  // Stop game loops
  clearInterval(gameState.spawnInterval);
  clearInterval(gameState.timerInterval);

  // Disable input
  wordInput.disabled = true;

  // Remove all remaining falling words
  gameState.fallingWords.forEach((wordObj) => {
    if (wordObj.element && wordObj.element.parentNode) {
      wordObj.element.parentNode.removeChild(wordObj.element);
    }
  });
  gameState.fallingWords = [];

  // Display final score
  finalScoreDisplay.textContent = gameState.score;

  // Set victory or defeat message
  if (timeUp && gameState.lives > 0) {
    // Player survived the full 60 seconds - VICTORY!
    resultMessage.textContent = "Victory!";
    resultIcon.textContent = "🏆";
  } else {
    // Player lost all lives - GAME OVER
    resultMessage.textContent = "Game Over!";
    resultIcon.textContent = "💀";
  }

  // Show game over screen
  gameOverDiv.classList.remove("hidden");
}

// ============================================
// INPUT HANDLING
// ============================================
/**
 * Handles player typing in the input field
 * - Checks if typed word matches any falling word
 * - If match found: removes word, adds score, clears input
 */
wordInput.addEventListener("input", (e) => {
  const typedWord = e.target.value.trim().toLowerCase();

  if (typedWord === "") return; // Ignore empty input

  // Check each falling word for a match
  for (let wordObj of gameState.fallingWords) {
    if (wordObj.text.toLowerCase() === typedWord) {
      // Match found!
      wordObj.element.classList.add("matched"); // Add visual effect
      gameState.score += 10; // Add points
      scoreDisplay.textContent = gameState.score;

      // Remove word after brief delay (to show matched animation)
      setTimeout(() => removeWord(wordObj, false), 200); // false = not missed
      wordInput.value = ""; // Clear input for next word
      break; // Stop checking after first match
    }
  }
});

// ============================================
// EVENT LISTENERS
// ============================================
// Start game when start button is clicked
startBtn.addEventListener("click", startGame);

// Restart game when restart button is clicked
restartBtn.addEventListener("click", startGame);
