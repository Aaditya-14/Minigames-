const choices = ['rock', 'paper', 'scissors'];
const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

const playerScoreEl = document.getElementById('playerScore');
const botScoreEl = document.getElementById('botScore');
const messageEl = document.getElementById('message');
const playerMoveEl = document.getElementById('playerMove');
const botMoveEl = document.getElementById('botMove');
const resetBtn = document.getElementById('reset');
const soundToggle = document.getElementById('soundToggle');
const botAudio = document.getElementById('botAudio');

let playerScore = 0;
let botScore = 0;

// Load scores from localStorage
try{
  const s = localStorage.getItem('rps_scores');
  if(s){
    const parsed = JSON.parse(s);
    playerScore = parsed.player || 0;
    botScore = parsed.bot || 0;
  }
} catch(e){ console.warn('localStorage load failed', e); }

playerScoreEl.textContent = playerScore;
botScoreEl.textContent = botScore;

function saveScores(){
  try{
    localStorage.setItem('rps_scores', JSON.stringify({ player: playerScore, bot: botScore }));
  } catch(e){ /* ignore */ }
}

function botChoice(){
  return choices[Math.floor(Math.random()*choices.length)];
}

let inputLocked = false;

function formatMoveLabel(m){
  return m[0].toUpperCase() + m.slice(1);
}

function updateScoresAndMessage(playerMove, botMove, result) {
  playerScoreEl.textContent = playerScore;
  botScoreEl.textContent = botScore;
  playerMoveEl.textContent = playerMove ? formatMoveLabel(playerMove) : '—';
  botMoveEl.textContent = botMove ? formatMoveLabel(botMove) : '—';

  const messages = {
    win: 'You win!',
    lose: 'You lose',
    draw: 'Draw!',
    default: 'Make your move!'
  };

  messageEl.textContent = messages[result] || messages.default;
  messageEl.className = result || '';

  if (result) {
    playSound(result);
  }
  saveScores();
}

function play(player){
  if(inputLocked) return;
  inputLocked = true;

  // clear previous highlights
  document.querySelectorAll('.choice').forEach(b => b.classList.remove('selected','animating','bot-choose'));

  const playerBtn = document.querySelector(`.choice[data-move="${player}"]`);
  // animate player's button
  playerBtn.classList.add('animating','selected');
  playerMoveEl.textContent = formatMoveLabel(player);

  // delay bot for a moment to show player's animation
  const bot = botChoice();

  // highlight bot's eventual button briefly after delay
  setTimeout(() => {
    const botBtn = document.querySelector(`.choice[data-move="${bot}"]`);
    botBtn.classList.add('bot-choose');
    botMoveEl.textContent = formatMoveLabel(bot);

    // play bot reveal audio if available and sound enabled
    if(soundToggle.checked && botAudio){
      try{
        // rewind and play
        botAudio.currentTime = 0;
        const p = botAudio.play();
        if (p instanceof Promise) {
          p.catch(e => console.warn("Audio playback failed.", e));
        }
      } catch(e){ /* ignore playback errors */ }
    }

    // determine result after bot reveal
    if(player === bot){
      messageEl.textContent = 'Draw!';
      updateScoresAndMessage(player, bot, 'draw');
    } else if(beats[player] === bot){
      playerScore++;
      updateScoresAndMessage(player, bot, 'win');
    } else {
      botScore++;
      updateScoresAndMessage(player, bot, 'lose');
    }

    // release input after animations finish
    setTimeout(() => {
      document.querySelectorAll('.choice').forEach(b => b.classList.remove('animating','bot-choose'));
      inputLocked = false;
    }, 300);

  }, 240);
}

// Attach listeners
document.querySelectorAll('.choice').forEach(btn => {
  btn.addEventListener('click', () => play(btn.dataset.move));
});

resetBtn.addEventListener('click', () => {
  playerScore = 0; botScore = 0;
  updateScoresAndMessage(null, null, null);
  document.querySelectorAll('.choice').forEach(b => b.classList.remove('selected'));
});

function playSound(type){
  if(!soundToggle.checked) return;
  // simple tones using WebAudio
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if(type === 'win'){ o.frequency.value = 880; g.gain.value = 0.1; }
    else if(type === 'lose'){ o.frequency.value = 220; g.gain.value = 0.1; }
    else { o.frequency.value = 440; g.gain.value = 0.05; }
    o.start(); o.stop(ctx.currentTime + 0.08);
  } catch(e){ /* ignore */ }
}
