// ============================================
// GAME CONFIGURATION
// ============================================
const WORD_BANK = [
  "laptop","desktop","tablet","netbook","bottle","battle","beetle","bootleg",
  "pillow","willow","fellow","hollow","chair","stair","spare","share",
  "phone","drone","clone","prone","wallet","mallet","ballot","pallet",
  "glasses","classes","masses","passes","watch","catch","patch","match",
  "keyboard","cupboard","clipboard","surfboard","mouse","house","blouse","grouse",
  "lamp","ramp","camp","damp","mirror","terror","error","fervor","towel","vowel",
  "bowel","trowel","blanket","bracket","packet","racket","backpack","feedback",
  "setback","playback","umbrella","vanilla","gorilla","chinchilla","camera","chimera",
  "era","tiara","headphones","microphones","earphones","telephones","charger","larger",
  "merger","burger","notebook","lookbook","cookbook","textbook","pencil","stencil",
  "utensil","fossil","scissors","sensors","censors","vectors","stapler","sampler",
  "chapter","adapter","calendar","cylinder","reminder","defender","clock","block",
  "flock","stock","hammer","glamour","clamor","grammar","wrench","trench","french",
  "bench","drill","grill","frill","trill","screwdriver","survivor","provider","reviver",
  "paintbrush","toothbrush","airbrush","crushbrush","bucket","cricket","ticket","thicket",
  "ladder","madder","bladder","adder","shovel","novel","hovel","grovel","rake","brake",
  "stake","snake"
];

const TOTAL_WORDS = 20;
const MIN_UNIQUE_WORDS = 10;
const REPEATS_TO_WIN = 10;
const TOTAL_GAME_TIME = 35; // seconds

// ============================================
// GAME STATE
// ============================================
let gameState = {
  wordIndex: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  wordSequence: [],
  shownWords: new Set(),
  currentWord: "",
  isGameActive: false,
  gameTimeLeft: TOTAL_GAME_TIME,
  totalGameTimer: null,
  muted: false,
  paused: false,
};

// ============================================
// DOM ELEMENTS
// ============================================
const el = {
  // Screens
  startScreen: document.getElementById("startScreen"),
  gameScreen: document.getElementById("gameScreen"),
  resultScreen: document.getElementById("resultScreen"),

  // Buttons
  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  repeatBtn: document.getElementById("repeatBtn"),
  newBtn: document.getElementById("newBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resumeBtn: document.getElementById("resumeBtn"),
  muteToggle: document.getElementById("muteToggle"),

  // Displays
  wordCount: document.getElementById("wordCount"),
  repeatsFound: document.getElementById("repeatsFound"),
  wordDisplay: document.getElementById("wordDisplay"),
  feedback: document.getElementById("feedback"),
  timer: document.getElementById("timer"),

  // Results
  correctAnswers: document.getElementById("correctAnswers"),
  wrongAnswers: document.getElementById("wrongAnswers"),
  resultIcon: document.getElementById("resultIcon"),
  resultTitle: document.getElementById("resultTitle"),
  resultMessage: document.getElementById("resultMessage"),

  // Overlays
  countdown: document.getElementById("countdown"),
  countNum: document.getElementById("countNum"),
  confetti: document.getElementById("confetti"),
};

// ============================================
// AUDIO (tiny synth beeps)
// ============================================
function beep(freq = 600, dur = 120, vol = 0.25) {
  if (gameState.muted) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  setTimeout(() => osc.stop(), dur);
}
const sounds = {
  correct: () => beep(820, 110, 0.25),
  wrong: () => beep(200, 220, 0.25),
  start: () => {
    beep(600, 90, 0.2);
    setTimeout(() => beep(800, 90, 0.2), 100);
  },
  gameOver: () => {
    beep(400, 120, 0.2);
    setTimeout(() => beep(300, 120, 0.2), 120);
    setTimeout(() => beep(220, 140, 0.2), 260);
  },
};

// ============================================
// HELPERS
// ============================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function switchScreen(show) {
  [el.startScreen, el.gameScreen, el.resultScreen].forEach((s) =>
    s.classList.remove("active")
  );
  show.classList.add("active");
}

function showFeedback(ok, msg) {
  el.feedback.textContent = msg || (ok ? "✓ CORRECT!" : "✗ WRONG!");
  el.feedback.className = "feedback show " + (ok ? "correct" : "wrong");
  setTimeout(() => el.feedback.classList.remove("show"), 600);
}

function haptic(ms = 30) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

// Confetti (simple emoji sprinkle)
function fireConfetti() {
  const emojis = ["🎉", "✨", "🎊", "⭐", "💫", "🔥"];
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("span");
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDuration = 2 + Math.random() * 2 + "s";
    el.confetti.appendChild(s);
    setTimeout(() => s.remove(), 4000);
  }
}

// ============================================
// SEQUENCE GENERATION (ensures enough repeats)
// ============================================
function generateWordSequence() {
  // try up to 50 times to ensure enough repeats
  for (let attempt = 0; attempt < 50; attempt++) {
    const pool = shuffle(WORD_BANK);
    const sequence = [];
    const uniq = new Set();

    // seed with unique words
    for (let i = 0; i < MIN_UNIQUE_WORDS; i++) {
      sequence.push(pool[i]);
      uniq.add(pool[i]);
    }

    // fill rest with repeats (avoid repeating last 2 to reduce immediate repeats)
    const remaining = TOTAL_WORDS - MIN_UNIQUE_WORDS;
    for (let i = 0; i < remaining; i++) {
      const options = Array.from(uniq);
      const recent = sequence.slice(-2);
      const avail = options.filter((w) => !recent.includes(w));
      const source = avail.length ? avail : options.filter((w) => w !== sequence.at(-1));
      const pick = source[Math.floor(Math.random() * source.length)];
      sequence.push(pick);
    }

    // light shuffle to mix new/repeats
    const mixed = shuffle(sequence);
    const seen = new Set();
    let repeats = 0;
    mixed.forEach((w) => (seen.has(w) ? repeats++ : seen.add(w)));
    if (repeats >= REPEATS_TO_WIN) return mixed;
  }
  // fallback
  return shuffle(WORD_BANK).slice(0, TOTAL_WORDS);
}

// ============================================
// CORE GAME FLOW
// ============================================
function initGame() {
  gameState = {
    wordIndex: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    wordSequence: generateWordSequence(),
    shownWords: new Set(),
    currentWord: "",
    isGameActive: false,
    gameTimeLeft: TOTAL_GAME_TIME,
    totalGameTimer: null,
    muted: gameState.muted || false,
    paused: false,
  };
  updateStats();
  el.wordDisplay.textContent = "READY";
}

function startTotalGameTimer() {
  clearInterval(gameState.totalGameTimer);
  const tick = 100; // ms
  gameState.totalGameTimer = setInterval(() => {
    if (!gameState.isGameActive || gameState.paused) return;
    gameState.gameTimeLeft = Math.max(0, gameState.gameTimeLeft - tick / 1000);
    el.timer.textContent = gameState.gameTimeLeft.toFixed(1) + "s";
    if (gameState.gameTimeLeft <= 0) endGame("timeup");
  }, tick);
}

function preCountdown(cb) {
  el.countdown.classList.add("active");
  let n = 3;
  el.countNum.textContent = n;
  const i = setInterval(() => {
    n--;
    if (n > 0) {
      el.countNum.textContent = n;
      beep(500 + 100 * n, 80, 0.2);
    } else {
      clearInterval(i);
      el.countdown.classList.remove("active");
      cb();
    }
  }, 700);
}

function startGame() {
  sounds.start();
  initGame();
  switchScreen(el.gameScreen);
  preCountdown(() => {
    gameState.isGameActive = true;
    el.timer.textContent = TOTAL_GAME_TIME.toFixed(1) + "s";
    startTotalGameTimer();
    setTimeout(showNextWord, 200);
  });
}

function updateStats() {
  el.wordCount.textContent = `${gameState.wordIndex}/${TOTAL_WORDS}`;
  el.repeatsFound.textContent = `${gameState.correctAnswers}/${REPEATS_TO_WIN}`;
}

function showNextWord() {
  if (!gameState.isGameActive || gameState.paused) return;
  if (gameState.wordIndex >= TOTAL_WORDS) {
    endGame("won");
    return;
  }

  gameState.currentWord = gameState.wordSequence[gameState.wordIndex];
  el.wordDisplay.textContent = gameState.currentWord.toUpperCase();
  el.wordDisplay.style.animation = "none";
  setTimeout(() => (el.wordDisplay.style.animation = ""), 10);

  gameState.wordIndex++;
  updateStats();
}

function handleChoice(choseRepeat) {
  if (!gameState.isGameActive || gameState.paused) return;

  const isRepeat = gameState.shownWords.has(gameState.currentWord);
  const ok = choseRepeat === isRepeat;

  if (ok) {
    gameState.correctAnswers++;
    if (!isRepeat) gameState.shownWords.add(gameState.currentWord);

    sounds.correct();
    haptic(20);
    showFeedback(true, `✓ CORRECT!`);
    updateStats();
    setTimeout(showNextWord, 500);
  } else {
    gameState.wrongAnswers++;
    sounds.wrong();
    haptic(60);
    el.wordDisplay.classList.add("shake");
    const msg = isRepeat ? "That was a REPEAT!" : "That was a NEW word!";
    showFeedback(false, msg);
    setTimeout(() => {
      el.wordDisplay.classList.remove("shake");
      endGame("lost");
    }, 900);
  }
}

function endGame(reason) {
  gameState.isGameActive = false;
  clearInterval(gameState.totalGameTimer);
  sounds.gameOver();

  el.correctAnswers.textContent = gameState.correctAnswers;
  el.wrongAnswers.textContent = gameState.wrongAnswers;

  if (reason === "won") {
    el.resultIcon.textContent = "🏆";
    el.resultTitle.textContent = "YOU WIN!";
    el.resultMessage.textContent = `Amazing! You cleared ${TOTAL_WORDS} words with ${gameState.correctAnswers} perfect reads.`;
    fireConfetti();
  } else if (reason === "lost") {
    el.resultIcon.textContent = "😢";
    el.resultTitle.textContent = "GAME OVER";
    el.resultMessage.textContent = "One wrong move ends it. Try again!";
  } else if (reason === "timeup") {
    el.resultIcon.textContent = "⌛";
    el.resultTitle.textContent = "TIME'S UP!";
    el.resultMessage.textContent = `Out of time! Survive faster next round.`;
  } else {
    el.resultIcon.textContent = "🤷";
    el.resultTitle.textContent = "GAME OVER";
    el.resultMessage.textContent = "Better luck next time!";
  }

  switchScreen(el.resultScreen);
}

function restartGame() {
  switchScreen(el.startScreen);
}

// ============================================
// EVENTS
// ============================================
el.startBtn.addEventListener("click", startGame);
el.restartBtn.addEventListener("click", restartGame);
el.repeatBtn.addEventListener("click", () => handleChoice(true));
el.newBtn.addEventListener("click", () => handleChoice(false));

// keyboard
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (!gameState.isGameActive && k === "enter") {
    startGame();
    return;
  }
  if (!gameState.isGameActive) return;
  if (["r", "arrowleft"].includes(k)) handleChoice(true);
  else if (["n", "arrowright"].includes(k)) handleChoice(false);
  else if (k === " ") e.preventDefault();
});

// pause/resume
el.pauseBtn.addEventListener("click", () => {
  gameState.paused = true;
  el.pauseBtn.style.display = "none";
  el.resumeBtn.style.display = "block";
});
el.resumeBtn.addEventListener("click", () => {
  gameState.paused = false;
  el.pauseBtn.style.display = "block";
  el.resumeBtn.style.display = "none";
});

// mute toggle
el.muteToggle.addEventListener("click", () => {
  gameState.muted = !gameState.muted;
  el.muteToggle.textContent = gameState.muted ? "🔇 Muted" : "🔊 Sound";
  el.muteToggle.setAttribute("aria-pressed", String(gameState.muted));
});

console.log("🎮 Word Memory Challenge fixed & ready!");
