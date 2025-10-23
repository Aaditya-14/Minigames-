// Game State
const gameState = {
    wordsDecoded: 0,
    lives: 3,
    level: 1,
    currentMode: '',
    currentWord: '',
    currentEncrypted: '',
    currentHint: '',
    currentCategory: '',
    timer: 60,
    timerInterval: null,
    soundEnabled: true,
    hintsLeft: 3,
    totalHintsUsed: 0,
    startTime: 0,
    revealedLetters: []
};

// Word Database (All words have 7+ letters for hint availability)
const wordDatabase = [
    { word: 'CRYPTIC', hint: '� Hidden and mysterious', category: 'SECURITY' },
    { word: 'QUANTUM', hint: '⚛️ Smallest particle physics', category: 'SCIENCE' },
    { word: 'ALGORITHM', hint: '📊 Step-by-step procedure', category: 'PROGRAMMING' },
    { word: 'TERMINAL', hint: '⌨️ Command line interface', category: 'COMPUTING' },
    { word: 'FIREWALL', hint: '🛡️ Network protection', category: 'SECURITY' },
    { word: 'PROTOCOL', hint: '📋 Set of rules', category: 'NETWORKING' },
    { word: 'BANDWIDTH', hint: '📡 Data transfer capacity', category: 'NETWORKING' },
    { word: 'ENCRYPT', hint: '� Make secret', category: 'SECURITY' },
    { word: 'COMPILER', hint: '⚙️ Code translator', category: 'PROGRAMMING' },
    { word: 'SANDBOX', hint: '🏖️ Isolated testing environment', category: 'SECURITY' },
    { word: 'DATABASE', hint: '💾 Organized data storage', category: 'COMPUTING' },
    { word: 'FUNCTION', hint: '⚡ Reusable code block', category: 'PROGRAMMING' },
    { word: 'VARIABLE', hint: '� Data container', category: 'PROGRAMMING' },
    { word: 'SECURITY', hint: '🔐 Protection system', category: 'SECURITY' },
    { word: 'NETWORK', hint: '🌐 Connected systems', category: 'NETWORKING' },
    { word: 'MACHINE', hint: '� Computing device', category: 'TECHNOLOGY' },
    { word: 'INTERNET', hint: '🌍 Global network', category: 'NETWORKING' },
    { word: 'JAVASCRIPT', hint: '📜 Web programming language', category: 'PROGRAMMING' },
    { word: 'PYTHON', hint: '� Programming language', category: 'PROGRAMMING' },
    { word: 'ENCODING', hint: '� Data conversion', category: 'COMPUTING' },
    { word: 'DECODING', hint: '� Reverse encoding', category: 'COMPUTING' },
    { word: 'HACKING', hint: '� Unauthorized access', category: 'SECURITY' },
    { word: 'INTERFACE', hint: '🖥️ User interaction point', category: 'COMPUTING' },
    { word: 'BACKEND', hint: '⚙️ Server-side logic', category: 'PROGRAMMING' },
    { word: 'FRONTEND', hint: '🎨 Client-side interface', category: 'PROGRAMMING' },
    { word: 'MALWARE', hint: '🦠 Malicious software', category: 'SECURITY' },
    { word: 'ANTIVIRUS', hint: '�️ Protection software', category: 'SECURITY' },
    { word: 'HARDWARE', hint: '🔧 Physical components', category: 'TECHNOLOGY' },
    { word: 'SOFTWARE', hint: '� Programs and apps', category: 'TECHNOLOGY' },
    { word: 'DOWNLOAD', hint: '⬇️ Get from internet', category: 'NETWORKING' },
    { word: 'UPLOAD', hint: '⬆️ Send to server', category: 'NETWORKING' },
    { word: 'STREAMING', hint: '� Continuous data flow', category: 'NETWORKING' },
    { word: 'BLOCKCHAIN', hint: '⛓️ Distributed ledger', category: 'TECHNOLOGY' },
    { word: 'ARTIFICIAL', hint: '� Man-made intelligence', category: 'TECHNOLOGY' },
    { word: 'DEBUGGER', hint: '🐛 Error finding tool', category: 'PROGRAMMING' },
    { word: 'OPTIMIZE', hint: '⚡ Improve performance', category: 'PROGRAMMING' },
    { word: 'FRAMEWORK', hint: '�️ Development structure', category: 'PROGRAMMING' },
    { word: 'REPOSITORY', hint: '📚 Code storage', category: 'PROGRAMMING' },
    { word: 'DEPLOYMENT', hint: '� Release to production', category: 'PROGRAMMING' },
    { word: 'CONTAINER', hint: '📦 Isolated environment', category: 'TECHNOLOGY' }
];

// Binary Map (A=00001, B=00010, etc.)
const binaryMap = {};
for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    binaryMap[letter] = (i + 1).toString(2).padStart(5, '0');
}

// DOM Elements
const elements = {
    modeSelector: document.getElementById('modeSelector'),
    gameArea: document.getElementById('gameArea'),
    gameOver: document.getElementById('gameOver'),
    encryptedWord: document.getElementById('encryptedWord'),
    hintText: document.getElementById('hintText'),
    hintInfo: document.getElementById('hintInfo'),
    guessInput: document.getElementById('guessInput'),
    submitBtn: document.getElementById('submitBtn'),
    revealBtn: document.getElementById('revealBtn'),
    feedback: document.getElementById('feedback'),
    score: document.getElementById('score'),
    hintsLeft: document.getElementById('hintsLeft'),
    timer: document.getElementById('timer'),
    lives: document.getElementById('lives'),
    level: document.getElementById('level'),
    status: document.getElementById('status'),
    modeInfo: document.getElementById('modeInfo'),
    decoderToggle: document.getElementById('decoderToggle'),
    decoderContent: document.getElementById('decoderContent'),
    soundToggle: document.getElementById('soundToggle'),
    soundIcon: document.getElementById('soundIcon'),
    restartBtn: document.getElementById('restartBtn'),
    finalScore: document.getElementById('finalScore'),
    timeSurvived: document.getElementById('timeSurvived'),
    hintsUsedTotal: document.getElementById('hintsUsedTotal'),
    rank: document.getElementById('rank'),
    gameOverTitle: document.getElementById('gameOverTitle')
};

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    typewriterEffect(elements.status, 'AWAITING MODE SELECTION');
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Disable copy/cut/paste shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A (except in input field)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'a')) {
            if (e.target.tagName !== 'INPUT') {
                e.preventDefault();
                return false;
            }
        }
    });
    
    // Disable copy event
    document.addEventListener('copy', (e) => {
        if (e.target.tagName !== 'INPUT') {
            e.preventDefault();
            return false;
        }
    });
});

// Event Listeners
function setupEventListeners() {
    // Mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => startGame(btn.dataset.mode));
    });

    // Submit guess
    elements.submitBtn.addEventListener('click', submitGuess);
    elements.guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitGuess();
    });

    // Reveal letter button
    elements.revealBtn.addEventListener('click', revealLetter);

    // Decoder toggle
    elements.decoderToggle.addEventListener('click', toggleDecoder);

    // Sound toggle
    elements.soundToggle.addEventListener('click', toggleSound);

    // Restart
    elements.restartBtn.addEventListener('click', restartGame);
}

// Start Game
function startGame(mode) {
    gameState.currentMode = 'binary'; // Always use binary mode
    gameState.startTime = Date.now();
    elements.modeSelector.style.display = 'none';
    elements.gameArea.style.display = 'block';
    
    updateModeInfo();
    setupDecoder();
    loadNewWord();
    startTimer();
    
    playSound('start');
}

// Load New Word
function loadNewWord() {
    const wordData = wordDatabase[Math.floor(Math.random() * wordDatabase.length)];
    gameState.currentWord = wordData.word;
    gameState.currentHint = wordData.hint;
    gameState.currentCategory = wordData.category;
    gameState.revealedLetters = [];
    gameState.hintsLeft = 3;
    
    // Encrypt word
    gameState.currentEncrypted = encryptWord(gameState.currentWord, gameState.currentMode);
    
    // Display
    elements.encryptedWord.textContent = gameState.currentEncrypted;
    
    // Show word length with underscores
    const placeholder = '_ '.repeat(gameState.currentWord.length).trim();
    elements.hintText.textContent = placeholder;
    
    elements.guessInput.value = '';
    elements.guessInput.focus();
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    
    // Reset reveal button
    elements.revealBtn.disabled = false;
    elements.revealBtn.style.opacity = '1';
    elements.revealBtn.innerHTML = '<span>💡 REVEAL LETTER (3 remaining)</span>';
    
    elements.hintInfo.textContent = `💡 ${gameState.currentWord.length} letter word - 3 hints available!`;
    elements.hintInfo.style.color = '#00ff00';
    
    // Reset timer
    gameState.timer = 60 - (gameState.level * 2); // Harder at higher levels
    if (gameState.timer < 30) gameState.timer = 30;
    updateDisplay();
}

// Encrypt Word (Binary Only)
function encryptWord(word, mode) {
    return word.split('').map(char => binaryMap[char] || char).join(' ');
}

// Submit Guess
function submitGuess() {
    const guess = elements.guessInput.value.toUpperCase().trim();
    
    if (!guess) {
        showFeedback('⚠️ ENTER A WORD!', 'incorrect');
        return;
    }
    
    if (guess === gameState.currentWord) {
        handleCorrectGuess();
    } else {
        handleIncorrectGuess();
    }
}

// Handle Correct Guess
function handleCorrectGuess() {
    gameState.wordsDecoded++;
    
    let message = '✅ CORRECT! BINARY DECODED!';
    if (gameState.hintsLeft === 3) {
        message += ' ⭐ NO HINTS USED!';
    }
    
    showFeedback(message, 'correct');
    
    // Level up every 3 words
    if (gameState.wordsDecoded % 3 === 0) {
        gameState.level++;
    }
    
    playSound('correct');
    updateDisplay();
    
    setTimeout(() => {
        elements.hintText.textContent = '_ '.repeat(gameState.currentWord.length).trim(); // Clear hints for next word
        loadNewWord();
    }, 2000);
}

// Handle Incorrect Guess
function handleIncorrectGuess() {
    gameState.lives--;
    
    if (gameState.lives <= 0) {
        showFeedback(`❌ GAME OVER! The word was: ${gameState.currentWord}`, 'incorrect');
        playSound('incorrect');
        setTimeout(() => {
            endGame(false);
        }, 3000);
    } else {
        showFeedback(`❌ INCORRECT! The word was: ${gameState.currentWord} | Lives: ${getLivesDisplay()}`, 'incorrect');
        elements.guessInput.classList.add('shake');
        setTimeout(() => elements.guessInput.classList.remove('shake'), 500);
        playSound('incorrect');
        updateDisplay();
        
        // Load new word after showing the answer
        setTimeout(() => {
            elements.hintText.textContent = '_ '.repeat(gameState.currentWord.length).trim(); // Clear hints for next word
            loadNewWord();
        }, 3000);
    }
}

// Reveal letter hint function
function revealLetter() {
    if (gameState.hintsLeft < 1) {
        return;
    }
    
    // Check if all letters are already revealed
    if (gameState.revealedLetters.length >= gameState.currentWord.length) {
        return;
    }
    
    gameState.hintsLeft--;
    gameState.totalHintsUsed++;
    
    // Find unrevealed letter
    let index;
    let attempts = 0;
    do {
        index = Math.floor(Math.random() * gameState.currentWord.length);
        attempts++;
        if (attempts > 100) {
            return;
        }
    } while (gameState.revealedLetters.includes(index));
    
    gameState.revealedLetters.push(index);
    
    // Show revealed letters with underscores for unrevealed ones
    const revealedWord = gameState.currentWord.split('').map((char, i) => {
        return gameState.revealedLetters.includes(i) ? char : '_';
    }).join(' ');
    
    elements.hintText.textContent = revealedWord;
    
    // Update button text
    if (gameState.hintsLeft > 0) {
        elements.revealBtn.innerHTML = `<span>💡 REVEAL LETTER (${gameState.hintsLeft} remaining)</span>`;
    } else {
        elements.revealBtn.disabled = true;
        elements.revealBtn.style.opacity = '0.5';
        elements.revealBtn.innerHTML = '<span>❌ No hints left</span>';
    }
    
    playSound('reveal');
    updateDisplay();
}

// Timer
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        
        if (gameState.timer <= 10) {
            elements.timer.classList.add('warning');
        }
        
        if (gameState.timer <= 0) {
            clearInterval(gameState.timerInterval);
            gameState.lives--;
            
            if (gameState.lives <= 0) {
                showFeedback(`⏰ TIME'S UP! The word was: ${gameState.currentWord}`, 'incorrect');
                setTimeout(() => {
                    endGame(false);
                }, 3000);
            } else {
                showFeedback(`⏰ TIME'S UP! The word was: ${gameState.currentWord} | Lives: ${getLivesDisplay()}`, 'incorrect');
                updateDisplay();
                setTimeout(() => {
                    loadNewWord();
                }, 3000);
            }
        }
        
        updateDisplay();
    }, 1000);
}

// End Game
function endGame(victory) {
    clearInterval(gameState.timerInterval);
    
    const timeSurvived = Math.floor((Date.now() - gameState.startTime) / 1000);
    
    elements.gameArea.style.display = 'none';
    elements.gameOver.style.display = 'flex';
    
    if (victory) {
        elements.gameOverTitle.textContent = '🎉 MISSION COMPLETE';
    } else {
        elements.gameOverTitle.textContent = `💀 SYSTEM FAILURE | Last Word: ${gameState.currentWord}`;
    }
    
    elements.finalScore.textContent = gameState.wordsDecoded;
    elements.timeSurvived.textContent = `${timeSurvived}s`;
    elements.hintsUsedTotal.textContent = gameState.totalHintsUsed;
    
    // Calculate rank
    const rank = calculateRank(gameState.wordsDecoded);
    elements.rank.textContent = rank;
    
    playSound(victory ? 'victory' : 'gameover');
}

// Calculate Rank
function calculateRank(wordsDecoded) {
    if (wordsDecoded >= 20) return '🏆 MASTER CRYPTOGRAPHER';
    if (wordsDecoded >= 15) return '💎 EXPERT DECODER';
    if (wordsDecoded >= 10) return '⭐ ADVANCED HACKER';
    if (wordsDecoded >= 5) return '🔓 SKILLED ANALYST';
    return '🔰 NOVICE CODEBREAKER';
}

// Restart Game
function restartGame() {
    gameState.wordsDecoded = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.timer = 60;
    gameState.hintsLeft = 3;
    gameState.totalHintsUsed = 0;
    gameState.startTime = 0;
    
    elements.gameOver.style.display = 'none';
    elements.modeSelector.style.display = 'block';
    
    updateDisplay();
}

// Update Mode Info
function updateModeInfo() {
    elements.modeInfo.textContent = 'MODE: BINARY CODE';
}

// Setup Decoder Reference (Binary Only)
function setupDecoder() {
    let content = '<div style="margin-bottom: 15px;"><strong>📖 BINARY DECODER KEY:</strong></div>';
    content += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 12px;">';
    
    for (let [letter, code] of Object.entries(binaryMap)) {
        content += `<div style="padding: 5px; background: rgba(0,255,0,0.05); border: 1px solid rgba(0,255,0,0.3);">${letter} = ${code}</div>`;
    }
    
    content += '</div>';
    content += '<div style="margin-top: 15px; padding: 10px; border: 1px solid #00ff00; background: rgba(0,255,0,0.05);">';
    content += '<strong>💡 TIP:</strong> Each 5-digit binary number represents one letter. A=00001, B=00010, C=00011, etc.';
    content += '</div>';
    
    elements.decoderContent.innerHTML = content;
}

// Toggle Decoder
function toggleDecoder() {
    const isHidden = elements.decoderContent.style.display === 'none';
    elements.decoderContent.style.display = isHidden ? 'block' : 'none';
    elements.decoderToggle.textContent = isHidden ? '> HIDE DECODER REFERENCE' : '> SHOW DECODER REFERENCE';
}

// Toggle Sound
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    elements.soundIcon.textContent = gameState.soundEnabled ? '🔊' : '🔇';
}

// Show Feedback
function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${type}`;
    elements.feedback.classList.add('flash');
    setTimeout(() => elements.feedback.classList.remove('flash'), 500);
}

// Update Display
function updateDisplay() {
    elements.score.textContent = gameState.wordsDecoded;
    elements.hintsLeft.textContent = '💡'.repeat(gameState.hintsLeft);
    elements.timer.textContent = gameState.timer;
    elements.lives.textContent = getLivesDisplay();
    elements.level.textContent = gameState.level;
}

// Get Lives Display
function getLivesDisplay() {
    return '❤️'.repeat(gameState.lives);
}

// Play Sound (Simplified - uses Web Audio API for beeps)
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
        case 'correct':
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        
        case 'incorrect':
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        
        case 'start':
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.2;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        
        case 'reveal':
            oscillator.frequency.value = 400;
            gainNode.gain.value = 0.2;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
    }
}

// Typewriter Effect
function typewriterEffect(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    const interval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
        }
    }, speed);
}
