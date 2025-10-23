// ============================================
// GAME STATE - Stores all game variables
// ============================================
let gameState = {
  level: 1, // Current level (1-10)
  attempts: 3, // Remaining attempts per level
  sequenceLength: 3, // Number of nodes in sequence
  currentSequence: [], // The correct sequence to memorize
  playerSequence: [], // Player's input sequence
  isShowingSequence: false, // Flag: showing sequence animation
  isPlayerTurn: false, // Flag: player can input
  maxLevel: 10, // Maximum level to complete game
  timeRemaining: 30, // Time limit in seconds (30 second timer)
  timerInterval: null, // Reference to timer interval
};

// ============================================
// DOM ELEMENTS - References to HTML elements
// ============================================
const startBtn = document.getElementById("startBtn");
const statusMessage = document.getElementById("statusMessage");
const scanLine = document.getElementById("scanLine");
const fpNodes = document.querySelectorAll(".fp-node");
const resultPanel = document.getElementById("resultPanel");
const resultIcon = document.getElementById("resultIcon");
const resultText = document.getElementById("resultText");
const continueBtn = document.getElementById("continueBtn");
const levelDisplay = document.getElementById("level");
const attemptsDisplay = document.getElementById("attempts");
const sequenceLengthDisplay = document.getElementById("sequenceLength");
const timestampDisplay = document.getElementById("timestamp");
const timerDisplay = document.getElementById("timer");

// ============================================
// AUDIO ELEMENTS - Sound effects
// ============================================
const beepSound = document.getElementById("beepSound");
const successSound = document.getElementById("successSound");
const failSound = document.getElementById("failSound");

// ============================================
// INITIALIZATION - Setup game on page load
// ============================================
function init() {
  updateDisplay(); // Update all display elements
  updateTimestamp(); // Show current time
  setInterval(updateTimestamp, 1000); // Update time every second

  // Event listeners
  startBtn.addEventListener("click", startGame);
  continueBtn.addEventListener("click", hideResult);

  // Add click handler to each fingerprint node
  fpNodes.forEach((node) => {
    node.addEventListener("click", () => handleNodeClick(node));
  });
}

// ============================================
// UPDATE TIMESTAMP - Shows current date/time
// ============================================
function updateTimestamp() {
  const now = new Date();
  const formatted = now.toLocaleString("en-US", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  timestampDisplay.textContent = formatted;
}

// ============================================
// UPDATE DISPLAY - Refresh all UI elements
// ============================================
function updateDisplay() {
  levelDisplay.textContent = `LEVEL ${gameState.level}`;
  attemptsDisplay.textContent = gameState.attempts;
  sequenceLengthDisplay.textContent = gameState.sequenceLength;
  timerDisplay.textContent = gameState.timeRemaining;

  // Change timer color based on remaining time
  timerDisplay.classList.remove("warning", "danger");
  if (gameState.timeRemaining <= 10 && gameState.timeRemaining > 5) {
    timerDisplay.classList.add("warning"); // Yellow warning
  } else if (gameState.timeRemaining <= 5) {
    timerDisplay.classList.add("danger"); // Red danger with blink
  }
}

// ============================================
// START GAME - Begin new round
// ============================================
function startGame() {
  // Prevent starting if already in progress
  if (gameState.isShowingSequence || gameState.isPlayerTurn) return;

  startBtn.disabled = true;
  statusMessage.textContent = "INITIALIZING SCAN...";
  scanLine.classList.add("active"); // Show scanning animation

  // After 2 second scan animation, start the sequence
  setTimeout(() => {
    scanLine.classList.remove("active");
    generateSequence(); // Create random sequence
    showSequence(); // Display sequence to memorize
  }, 2000);
}

// ============================================
// GENERATE SEQUENCE - Create random pattern
// ============================================
function generateSequence() {
  gameState.currentSequence = []; // Clear previous sequence
  gameState.playerSequence = []; // Clear player input

  // Generate random node indices (0-8)
  for (let i = 0; i < gameState.sequenceLength; i++) {
    const randomNode = Math.floor(Math.random() * 9);
    gameState.currentSequence.push(randomNode);
  }
}

// ============================================
// SHOW SEQUENCE - Display pattern to memorize
// ============================================
function showSequence() {
  gameState.isShowingSequence = true;
  statusMessage.textContent = "MEMORIZE THE SEQUENCE...";

  let index = 0;

  // Light up each node in sequence with 800ms delay
  const interval = setInterval(() => {
    // When all nodes shown, start player turn
    if (index >= gameState.currentSequence.length) {
      clearInterval(interval);
      gameState.isShowingSequence = false;
      gameState.isPlayerTurn = true;
      statusMessage.textContent = "REPEAT THE SEQUENCE - 30 SECONDS!";
      startTimer(); // Start 30 second countdown
      return;
    }

    // Get the node to light up
    const nodeIndex = gameState.currentSequence[index];
    const node = fpNodes[nodeIndex];

    // Play sound and show glow effect
    playBeep();
    node.classList.add("glow");

    // Remove glow after 500ms
    setTimeout(() => {
      node.classList.remove("glow");
    }, 500);

    index++;
  }, 800);
}

// ============================================
// START TIMER - Begin 30 second countdown
// ============================================
function startTimer() {
  gameState.timeRemaining = 30; // Reset to 30 seconds
  updateDisplay();

  // Clear any existing timer
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  // Countdown every second
  gameState.timerInterval = setInterval(() => {
    gameState.timeRemaining--;
    updateDisplay();

    // Time's up!
    if (gameState.timeRemaining <= 0) {
      clearInterval(gameState.timerInterval);
      handleTimeout();
    }
  }, 1000);
}

// ============================================
// STOP TIMER - Clear countdown interval
// ============================================
function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

// ============================================
// HANDLE TIMEOUT - Player ran out of time
// ============================================
function handleTimeout() {
  gameState.isPlayerTurn = false;
  gameState.attempts--;

  playFail();
  statusMessage.textContent = "TIME EXPIRED!";

  // Clear any correct markers
  fpNodes.forEach((n) => {
    n.classList.remove("correct");
  });

  // Check if out of attempts
  if (gameState.attempts <= 0) {
    statusMessage.textContent = "ACCESS DENIED - NO ATTEMPTS REMAINING";
    setTimeout(() => {
      showResult(false, "ACCESS DENIED", "TIME LIMIT EXCEEDED");
      resetGame();
    }, 1500);
  } else {
    statusMessage.textContent = `TIME OUT! ${gameState.attempts} ATTEMPTS REMAINING`;
    updateDisplay();
    setTimeout(() => {
      gameState.playerSequence = [];
      showSequence(); // Show sequence again
    }, 2000);
  }
}

// ============================================
// HANDLE NODE CLICK - Player clicks a node
// ============================================
function handleNodeClick(node) {
  // Only allow clicks during player turn
  if (!gameState.isPlayerTurn || gameState.isShowingSequence) return;

  // Get which node was clicked (0-8)
  const nodeIndex = parseInt(node.getAttribute("data-node"));
  gameState.playerSequence.push(nodeIndex);

  // Visual and audio feedback
  playBeep();
  node.classList.add("glow");
  setTimeout(() => node.classList.remove("glow"), 300);

  // Check if this click was correct
  const currentIndex = gameState.playerSequence.length - 1;
  const expectedNode = gameState.currentSequence[currentIndex];

  // Wrong node clicked!
  if (nodeIndex !== expectedNode) {
    handleWrongSequence(node);
    return;
  }

  // Correct node - mark it green
  node.classList.add("correct");
  setTimeout(() => node.classList.remove("correct"), 500);

  // Check if entire sequence completed
  if (gameState.playerSequence.length === gameState.currentSequence.length) {
    handleCorrectSequence();
  }
}

// ============================================
// HANDLE CORRECT SEQUENCE - Player succeeded
// ============================================
function handleCorrectSequence() {
  gameState.isPlayerTurn = false;
  stopTimer(); // Stop the countdown timer
  statusMessage.textContent = "SEQUENCE VERIFIED!";
  playSuccess();

  setTimeout(() => {
    // Check if max level reached
    if (gameState.level >= gameState.maxLevel) {
      showResult(true, "MAXIMUM CLEARANCE ACHIEVED!", "ALL LEVELS COMPLETED");
      resetGame();
    } else {
      // Advance to next level
      showResult(true, "ACCESS GRANTED", `LEVEL ${gameState.level} COMPLETE`);
      gameState.level++;
      gameState.sequenceLength = Math.min(3 + gameState.level, 8); // Max 8 nodes
      gameState.attempts = 3; // Reset attempts
      updateDisplay();
    }
  }, 1000);
}

// ============================================
// HANDLE WRONG SEQUENCE - Player made mistake
// ============================================
function handleWrongSequence(node) {
  gameState.isPlayerTurn = false;
  stopTimer(); // Stop the countdown timer
  gameState.attempts--;

  // Show error feedback
  playFail();
  node.classList.add("wrong");
  setTimeout(() => node.classList.remove("wrong"), 500);

  // Clear all correct markers
  fpNodes.forEach((n) => {
    n.classList.remove("correct");
  });

  // Check if out of attempts
  if (gameState.attempts <= 0) {
    statusMessage.textContent = "ACCESS DENIED - NO ATTEMPTS REMAINING";
    setTimeout(() => {
      showResult(false, "ACCESS DENIED", "SECURITY BREACH DETECTED");
      resetGame();
    }, 1500);
  } else {
    // Give another try
    statusMessage.textContent = `INCORRECT! ${gameState.attempts} ATTEMPTS REMAINING`;
    updateDisplay();
    setTimeout(() => {
      gameState.playerSequence = [];
      showSequence(); // Show sequence again
    }, 2000);
  }
}

// ============================================
// SHOW RESULT - Display success/fail screen
// ============================================
function showResult(success, title, subtitle) {
  resultPanel.className = "result-panel show " + (success ? "success" : "fail");
  resultIcon.textContent = success ? "✓" : "✗";
  resultText.innerHTML = `<div style="font-size: 32px; margin-bottom: 10px;">${title}</div><div style="font-size: 18px;">${subtitle}</div>`;
}

// ============================================
// HIDE RESULT - Close result screen
// ============================================
function hideResult() {
  resultPanel.classList.remove("show");
  startBtn.disabled = false;
  statusMessage.textContent = "AWAITING INPUT...";
}

// ============================================
// RESET GAME - Return to level 1
// ============================================
function resetGame() {
  stopTimer(); // Clear any active timer
  gameState.level = 1;
  gameState.attempts = 3;
  gameState.sequenceLength = 3;
  gameState.currentSequence = [];
  gameState.playerSequence = [];
  gameState.isShowingSequence = false;
  gameState.isPlayerTurn = false;
  gameState.timeRemaining = 30;
  updateDisplay();
}

// ============================================
// AUDIO FUNCTIONS - Play sound effects
// ============================================
function playBeep() {
  beepSound.currentTime = 0;
  beepSound.play().catch(() => {}); // Catch if autoplay blocked
}

function playSuccess() {
  successSound.currentTime = 0;
  successSound.play().catch(() => {});
}

function playFail() {
  failSound.currentTime = 0;
  failSound.play().catch(() => {});
}

// ============================================
// START APPLICATION
// ============================================
init();
