// ============================================
// MATH IQ BLITZ - TRUE OR FALSE GAME
// ============================================
// A fast-paced math quiz game where players must answer 10 questions
// Each question has 5 seconds, one wrong answer = game over

// ============================================
// GAME STATE
// ============================================
// Stores all game variables and current state
let gameState = {
  timeLeft: 5, // Seconds remaining for current question
  currentQuestion: 1, // Current question number (1-10)
  totalQuestions: 10, // Total questions in the game
  correctAnswers: 0, // Number of correct answers
  currentEquation: null, // Current equation object {text, isCorrect}
  timerInterval: null, // Timer interval reference
  soundEnabled: true, // Sound on/off toggle
};

// ============================================
// CONSTANTS
// ============================================
// Available math operators for equations
const operators = ["+", "-", "×", "÷"];

// ============================================
// INITIALIZATION
// ============================================
// Set up event listeners when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Keyboard support for answering questions
  document.addEventListener("keydown", (e) => {
    // Only listen for keys when game is active
    if (document.getElementById("game").classList.contains("hidden")) return;

    // Arrow Left or F key = FALSE
    if (e.key === "ArrowLeft" || e.key === "f" || e.key === "F") {
      answer(false);
    }
    // Arrow Right or T key = TRUE
    else if (e.key === "ArrowRight" || e.key === "t" || e.key === "T") {
      answer(true);
    }
  });
});

// ============================================
// GAME FLOW FUNCTIONS
// ============================================

/**
 * Start a new game
 * Resets all state and shows the game screen
 */
function startGame() {
  // Reset all game state to initial values
  gameState.timeLeft = 5;
  gameState.currentQuestion = 1;
  gameState.correctAnswers = 0;

  // Switch screens: hide menu, show game
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("gameOver").classList.add("hidden");

  // Update UI elements
  updateQuestionNum();
  updateTimer();

  // Start the countdown timer
  startQuestionTimer();

  // Generate and display first equation
  generateEquation();
}

/**
 * Start/restart the 5-second countdown timer for current question
 * Timer ticks every second and plays sound
 */
function startQuestionTimer() {
  // Clear any existing timer
  clearInterval(gameState.timerInterval);

  // Reset time to 5 seconds
  gameState.timeLeft = 5;
  updateTimer();
  updateProgressBar();

  // Start countdown - runs every 1000ms (1 second)
  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft--;
    updateTimer();
    updateProgressBar();

    // Play tick sound each second
    playSound("tick");

    // Check if time ran out
    if (gameState.timeLeft <= 0) {
      // Stop timer
      clearInterval(gameState.timerInterval);

      // Show wrong feedback
      flashFeedback(false);
      playSound("wrong");

      // End game after brief delay
      setTimeout(() => {
        endGame("timeout");
      }, 500);
    }
  }, 1000);
}

/**
 * Generate a random math equation
 * Creates either a correct or incorrect equation (50/50 chance)
 * Difficulty increases as player progresses
 */
function generateEquation() {
  // Calculate difficulty level (1-5) based on current question
  const difficulty = Math.min(Math.floor(gameState.currentQuestion / 3) + 1, 5);

  // Max number increases with difficulty
  const maxNumber = 10 + difficulty * 5;

  let num1, num2, operator, result, displayResult, isCorrect;

  // Randomly decide if equation will be correct or wrong (50% chance)
  isCorrect = Math.random() > 0.5;

  // Pick random operator
  operator = operators[Math.floor(Math.random() * operators.length)];

  // Generate numbers based on operator type
  switch (operator) {
    case "+":
      // Addition: two random numbers
      num1 = Math.floor(Math.random() * maxNumber) + 1;
      num2 = Math.floor(Math.random() * maxNumber) + 1;
      result = num1 + num2;
      break;

    case "-":
      // Subtraction: ensure positive result
      num1 = Math.floor(Math.random() * maxNumber) + 10;
      num2 = Math.floor(Math.random() * num1) + 1;
      result = num1 - num2;
      break;

    case "×":
      // Multiplication: keep numbers reasonable (2-13)
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 12) + 2;
      result = num1 * num2;
      break;

    case "÷":
      // Division: ensure whole number result
      num2 = Math.floor(Math.random() * 10) + 2;
      result = Math.floor(Math.random() * 12) + 1;
      num1 = num2 * result; // Work backwards to ensure clean division
      break;
  }

  // Decide what result to display
  if (isCorrect) {
    // Show correct answer
    displayResult = result;
  } else {
    // Show wrong answer (off by 1-5)
    const offset = Math.floor(Math.random() * 5) + 1;
    displayResult = Math.random() > 0.5 ? result + offset : result - offset;

    // Ensure it's actually different from correct answer
    if (displayResult === result) displayResult = result + 1;
  }

  // Store equation data
  gameState.currentEquation = {
    text: `${num1} ${operator} ${num2} = ${displayResult}`,
    isCorrect: isCorrect,
  };

  // Display equation on screen
  document.getElementById("equation").textContent =
    gameState.currentEquation.text;
}

/**
 * Process player's answer (true or false)
 * @param {boolean} userAnswer - Player's answer (true = correct, false = wrong)
 */
function answer(userAnswer) {
  // Check if player's answer matches the equation's correctness
  const correct = userAnswer === gameState.currentEquation.isCorrect;

  if (correct) {
    // CORRECT ANSWER
    gameState.correctAnswers++;

    // Show green flash and play success sound
    flashFeedback(true);
    playSound("correct");

    // Check if all 10 questions completed
    if (gameState.currentQuestion >= gameState.totalQuestions) {
      // Player won! Stop timer and show victory screen
      clearInterval(gameState.timerInterval);
      setTimeout(() => {
        endGame("complete");
      }, 500);
    } else {
      // Move to next question
      gameState.currentQuestion++;
      updateQuestionNum();
      startQuestionTimer(); // Reset timer for next question
      generateEquation(); // Generate new equation
    }
  } else {
    // WRONG ANSWER - Game Over
    clearInterval(gameState.timerInterval);

    // Show red flash and play error sound
    flashFeedback(false);
    playSound("wrong");

    // Show game over screen after brief delay
    setTimeout(() => {
      endGame("wrong");
    }, 500);
  }
}

/**
 * End the game and show results
 * @param {string} reason - Why game ended: "complete", "wrong", or "timeout"
 */
function endGame(reason) {
  // Stop the timer
  clearInterval(gameState.timerInterval);

  // Switch to game over screen
  document.getElementById("game").classList.add("hidden");
  document.getElementById("gameOver").classList.remove("hidden");

  // Update title and color based on how game ended
  const titleElement = document.querySelector(".game-over-title");
  if (reason === "complete") {
    // Player won - all 10 correct!
    titleElement.textContent = "PERFECT!";
    titleElement.style.color = "#00ff88";
    playSound("correct");
  } else {
    // Player lost (wrong answer or timeout)
    titleElement.textContent = "GAME OVER";
    titleElement.style.color = "#ff4757";
  }

  // Display final score (X out of 10)
  document.getElementById(
    "correctAnswers"
  ).textContent = `${gameState.correctAnswers}/10`;
}

/**
 * Restart the game (called from game over screen)
 */
function restartGame() {
  startGame();
}

/**
 * Return to main menu (called from game over screen)
 */
function backToMenu() {
  document.getElementById("gameOver").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

/**
 * Flash the equation container green (correct) or red (wrong)
 * @param {boolean} correct - True for green flash, false for red flash
 */
function flashFeedback(correct) {
  const container = document.querySelector(".equation-container");
  const originalBorder = container.style.borderColor;

  // Change border color and glow
  container.style.borderColor = correct ? "#00ff88" : "#ff4757";
  container.style.boxShadow = correct
    ? "0 0 40px rgba(0, 255, 136, 0.6)"
    : "0 0 40px rgba(255, 71, 87, 0.6)";

  // Reset to original after 200ms
  setTimeout(() => {
    container.style.borderColor = originalBorder;
    container.style.boxShadow = "0 0 30px rgba(0, 212, 255, 0.2)";
  }, 200);
}

/**
 * Update the question number display (e.g., "3/10")
 */
function updateQuestionNum() {
  document.getElementById(
    "questionNum"
  ).textContent = `${gameState.currentQuestion}/${gameState.totalQuestions}`;
}

/**
 * Update the timer display and change color based on time left
 */
function updateTimer() {
  const timerElement = document.getElementById("timer");
  timerElement.textContent = gameState.timeLeft;

  // Change color based on urgency
  if (gameState.timeLeft <= 2) {
    timerElement.style.color = "#ff4757"; // Red - critical
  } else if (gameState.timeLeft <= 3) {
    timerElement.style.color = "#ffdd00"; // Yellow - warning
  } else {
    timerElement.style.color = "#00ff88"; // Green - safe
  }
}

/**
 * Update the progress bar width based on time remaining
 */
function updateProgressBar() {
  const progress = (gameState.timeLeft / 5) * 100;
  document.getElementById("progressBar").style.width = `${progress}%`;
}

// ============================================
// SOUND FUNCTIONS
// ============================================

/**
 * Toggle sound on/off
 */
function toggleSound() {
  gameState.soundEnabled = !gameState.soundEnabled;
  // Update icon
  document.getElementById("soundIcon").textContent = gameState.soundEnabled
    ? "🔊"
    : "🔇";
}

/**
 * Play a sound effect using Web Audio API
 * @param {string} type - Sound type: "correct", "wrong", or "tick"
 */
function playSound(type) {
  // Don't play if sound is disabled
  if (!gameState.soundEnabled) return;

  // Create audio context and oscillator for beep sounds
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Connect audio nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Configure sound based on type
  switch (type) {
    case "correct":
      // High pitch success beep
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      break;

    case "wrong":
      // Low pitch error beep
      oscillator.frequency.value = 200;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      break;

    case "tick":
      // Timer tick - gets louder and higher when time is running out
      if (gameState.timeLeft <= 2) {
        // Urgent tick (last 2 seconds)
        oscillator.frequency.value = 1200;
        gainNode.gain.value = 0.15;
      } else {
        // Normal tick
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.08;
      }
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
      break;
  }
}
