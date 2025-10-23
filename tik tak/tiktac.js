// AI Bot Logic
class TicTacToeBot {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
    }

    makeMove(board, botSymbol, playerSymbol) {
        switch (this.difficulty) {
            case 'easy':
                return this.easyMove(board);
            case 'medium':
                return this.mediumMove(board, botSymbol, playerSymbol);
            case 'hard':
                return this.hardMove(board, botSymbol, playerSymbol);
            default:
                return this.mediumMove(board, botSymbol, playerSymbol);
        }
    }

    // Easy: Random moves
    easyMove(board) {
        const availableMoves = this.getAvailableMoves(board);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Medium: Block player wins, try to win, otherwise random
    mediumMove(board, botSymbol, playerSymbol) {
        // Try to win
        const winMove = this.findWinningMove(board, botSymbol);
        if (winMove !== -1) return winMove;

        // Block player from winning
        const blockMove = this.findWinningMove(board, playerSymbol);
        if (blockMove !== -1) return blockMove;

        // Random move
        return this.easyMove(board);
    }

    // Hard: Minimax algorithm
    hardMove(board, botSymbol, playerSymbol) {
        const bestMove = this.minimax(board, botSymbol, playerSymbol, botSymbol, 0, true);
        return bestMove.index;
    }

    findWinningMove(board, symbol) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            const positions = [board[a], board[b], board[c]];
            
            // Check if two positions have the symbol and one is empty
            if (positions.filter(pos => pos === symbol).length === 2 && 
                positions.filter(pos => pos === '').length === 1) {
                
                if (board[a] === '') return a;
                if (board[b] === '') return b;
                if (board[c] === '') return c;
            }
        }
        return -1;
    }

    getAvailableMoves(board) {
        return board.map((cell, index) => cell === '' ? index : null)
                  .filter(index => index !== null);
    }

    checkWin(board, symbol) {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            return board[a] === symbol && board[b] === symbol && board[c] === symbol;
        });
    }

    checkDraw(board) {
        return board.every(cell => cell !== '');
    }

    // Minimax algorithm for hard difficulty
    minimax(board, botSymbol, playerSymbol, currentSymbol, depth, isMaximizing) {
        // Terminal states
        if (this.checkWin(board, botSymbol)) return { score: 10 - depth };
        if (this.checkWin(board, playerSymbol)) return { score: depth - 10 };
        if (this.checkDraw(board)) return { score: 0 };

        const availableMoves = this.getAvailableMoves(board);
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            let bestMove = availableMoves[0];
            
            for (let move of availableMoves) {
                board[move] = currentSymbol;
                const score = this.minimax(board, botSymbol, playerSymbol, playerSymbol, depth + 1, false).score;
                board[move] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            
            return { index: bestMove, score: bestScore };
        } else {
            let bestScore = Infinity;
            let bestMove = availableMoves[0];
            
            for (let move of availableMoves) {
                board[move] = currentSymbol;
                const score = this.minimax(board, botSymbol, playerSymbol, botSymbol, depth + 1, true).score;
                board[move] = '';
                
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            
            return { index: bestMove, score: bestScore };
        }
    }
}

class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = false; // Start inactive until names are entered
        this.isBotMode = false;
        this.botDifficulty = 'medium';
        this.bot = null;
        this.playerNames = {
            X: 'Player 1',
            O: 'Player 2'
        };
        this.scores = {
            x: 0,
            o: 0,
            draw: 0
        };
        
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerElement = document.getElementById('current-player');
        this.gameStatusElement = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-btn');
        this.changeNamesButton = document.getElementById('change-names-btn');
        this.scoreXElement = document.getElementById('score-x');
        this.scoreOElement = document.getElementById('score-o');
        this.scoreDrawElement = document.getElementById('score-draw');
        this.player1DisplayElement = document.getElementById('player1-display');
        this.player2DisplayElement = document.getElementById('player2-display');
        
        // Modal elements
        this.nameModal = document.getElementById('name-modal');
        this.nameForm = document.getElementById('name-form');
        this.player1NameInput = document.getElementById('player1-name');
        this.player2NameInput = document.getElementById('player2-name');
        
        // Bot mode elements
        this.pvpModeRadio = document.getElementById('pvp-mode');
        this.botModeRadio = document.getElementById('bot-mode');
        this.player2Group = document.getElementById('player2-group');
        this.botDifficultyGroup = document.getElementById('bot-difficulty-group');
        this.botDifficultySelect = document.getElementById('bot-difficulty');
        
        // Winner modal elements
        this.winnerModal = document.getElementById('winner-modal');
        this.winnerMessageElement = document.getElementById('winner-message');
        this.playAgainButton = document.getElementById('play-again-btn');

        this.cells.forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });
        
        this.resetButton.addEventListener('click', this.resetGame.bind(this));
        this.changeNamesButton.addEventListener('click', this.showNameModal.bind(this));
        this.nameForm.addEventListener('submit', this.handleNameSubmit.bind(this));
        
        // Game mode change handlers
        this.pvpModeRadio.addEventListener('change', this.handleModeChange.bind(this));
        this.botModeRadio.addEventListener('change', this.handleModeChange.bind(this));

        this.playAgainButton.addEventListener('click', () => {
            this.hideWinnerModal();
            this.resetGame();
        });
        
        this.showNameModal();
        this.updateDisplay();
        this.updateScores();
    }
    
    showNameModal() {
        this.hideWinnerModal(); // Ensure winner modal is hidden
        this.nameModal.classList.remove('hidden');
        this.player1NameInput.focus();
        this.gameActive = false;
    }
    
    hideNameModal() {
        this.nameModal.classList.add('hidden');
        this.gameActive = true;
    }

    showWinnerModal(message) {
        this.winnerMessageElement.textContent = message;
        this.winnerModal.classList.remove('hidden');
    }
    hideWinnerModal() {
        this.winnerModal.classList.add('hidden');
    }
    
    handleModeChange() {
        if (this.botModeRadio.checked) {
            this.player2Group.classList.add('hidden');
            this.botDifficultyGroup.classList.remove('hidden');
            this.player2NameInput.required = false;
        } else {
            this.player2Group.classList.remove('hidden');
            this.botDifficultyGroup.classList.add('hidden');
            this.player2NameInput.required = true;
        }
    }
    
    handleNameSubmit(event) {
        event.preventDefault();
        
        const player1Name = this.player1NameInput.value.trim();
        let player2Name = '';
        
        if (this.botModeRadio.checked) {
            this.isBotMode = true;
            this.botDifficulty = this.botDifficultySelect.value;
            this.bot = new TicTacToeBot(this.botDifficulty);
            player2Name = `Bot (${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)})`;
        } else {
            this.isBotMode = false;
            this.bot = null;
            player2Name = this.player2NameInput.value.trim();
        }
        
        if (player1Name && (player2Name || this.isBotMode)) {
            this.playerNames.X = player1Name;
            this.playerNames.O = player2Name;
            
            this.updatePlayerDisplays();
            this.hideNameModal();
            this.updateDisplay();
        }
    }
    
    updatePlayerDisplays() {
        this.player1DisplayElement.textContent = `${this.playerNames.X} (X)`;
        this.player2DisplayElement.textContent = `${this.playerNames.O} (O)`;
    }
    
    handleCellClick(event) {
        const cell = event.target;
        const cellIndex = parseInt(cell.getAttribute('data-index'));
        
        if (this.board[cellIndex] !== '' || !this.gameActive) {
            return;
        }
        
        // In bot mode, only allow human player (X) to click
        if (this.isBotMode && this.currentPlayer === 'O') {
            return;
        }
        
        this.makeMove(cellIndex, cell);
    }
    
    makeMove(index, cell) {
        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        if (this.checkWin()) {
            this.endGame(`${this.playerNames[this.currentPlayer]} Wins! 🎉`);
            this.scores[this.currentPlayer.toLowerCase()]++;
            this.highlightWinningCells();
            this.updateScores();
        } else if (this.checkDraw()) {
            this.endGame("It's a Draw! 🤝");
            this.scores.draw++;
            this.updateScores();
        } else {
            this.switchPlayer();
            
            // If it's bot mode and now it's the bot's turn (O), make bot move
            if (this.isBotMode && this.currentPlayer === 'O' && this.gameActive) {
                setTimeout(() => {
                    this.makeBotMove();
                }, 500); // Small delay for better UX
            }
        }
    }
    
    makeBotMove() {
        if (!this.gameActive || !this.isBotMode || this.currentPlayer !== 'O') return;
        
        const botMove = this.bot.makeMove([...this.board], 'O', 'X');
        const botCell = this.cells[botMove];
        
        if (botCell && this.board[botMove] === '') {
            this.makeMove(botMove, botCell);
        }
    }
    
    checkWin() {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    highlightWinningCells() {
        this.winningConditions.forEach(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                this.cells[a].classList.add('winning');
                this.cells[b].classList.add('winning');
                this.cells[c].classList.add('winning');
            }
        });
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    endGame(message) {
        this.gameActive = false;
        this.currentPlayerElement.textContent = 'Game Over';
        this.showWinnerModal(message);
    }
    
    updateDisplay() {
        if (this.gameActive) {
            this.currentPlayerElement.textContent = `${this.playerNames[this.currentPlayer]}'s Turn`;
            this.gameStatusElement.textContent = '';
        }
    }
    
    updateScores() {
        this.scoreXElement.textContent = this.scores.x;
        this.scoreOElement.textContent = this.scores.o;
        this.scoreDrawElement.textContent = this.scores.draw;
    }
    
    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.hideWinnerModal();
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell'; // Reset all classes
        });
        
        this.updateDisplay();
    }
}

// Add some fun sound effects (optional - using Web Audio API)
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playTone(frequency, duration) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMoveSound() {
        this.playTone(800, 0.1);
    }
    
    playWinSound() {
        this.playTone(1000, 0.2);
        setTimeout(() => this.playTone(1200, 0.2), 100);
        setTimeout(() => this.playTone(1400, 0.3), 200);
    }
}

// Enhanced TicTacToe class with sound effects
class EnhancedTicTacToe extends TicTacToe {
    constructor() {
        super();
        this.soundEffects = new SoundEffects();
    }
    
    makeMove(index, cell) {
        this.soundEffects.playMoveSound();
        super.makeMove(index, cell);
    }
    
    makeBotMove() {
        // Add a different sound for bot moves
        setTimeout(() => {
            this.soundEffects.playMoveSound();
        }, 250);
        super.makeBotMove();
    }
    
    endGame(message) {
        if (message.includes('Wins')) {
            this.soundEffects.playWinSound();
        }
        super.endGame(message);
    }
}

// Use the enhanced version for a better experience
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedTicTacToe();
});