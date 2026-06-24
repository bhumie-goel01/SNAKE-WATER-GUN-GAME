/* SNAKE WATER GUN — script.js | Developed by Bhumie Goel
   Snake=0 | Water=1 | Gun=-1
   Snake beats Water | Water beats Gun | Gun beats Snake
*/
'use strict';

var CHOICES = {
  snake: { value:  0, label: 'Snake', emoji: '🐍' },
  water: { value:  1, label: 'Water', emoji: '💧' },
  gun:   { value: -1, label: 'Gun',   emoji: '🔫' }
};
var VAL_KEY = { '0': 'snake', '1': 'water', '-1': 'gun' };
var CONF_COLORS = ['#22C55E','#8B5CF6','#EC4899','#06B6D4','#F97316','#FACC15','#34D399'];

var G = {
  name:  '',
  theme: 'dark',
  muted: false,
  stats: { wins:0, losses:0, draws:0, total:0, streak:0, best:0 },
  history: [],
  saved: false
};

var LS_THEME = 'swg_theme';
var LS_MUTE  = 'swg_mute';

function saveKey(name) { return 'swg_save_' + name.toUpperCase(); }

function saveProgress() {
  localStorage.setItem(saveKey(G.name), JSON.stringify({ name:G.name, stats:G.stats, history:G.history }));
  G.saved = true;
  toast('💾 Progress Saved!');
}

function loadProgress(name) {
  try { var raw = localStorage.getItem(saveKey(name)); return raw ? JSON.parse(raw) : null; }
  catch(e) { return null; }
}

function clearSave(name) { localStorage.removeItem(saveKey(name)); }

function loadPrefs() {
  G.theme = localStorage.getItem(LS_THEME) || 'dark';
  G.muted = localStorage.getItem(LS_MUTE) === '1';
}
function savePrefs() {
  localStorage.setItem(LS_THEME, G.theme);
  localStorage.setItem(LS_MUTE,  G.muted ? '1' : '0');
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', G.theme);
  document.getElementById('theme-btn').textContent = G.theme === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
  G.theme = G.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  savePrefs();
}

var _ctx = null;
function ac() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}
function beep(f, d, g, t, dl) {
  try {
    var c=ac(), o=c.createOscillator(), v=c.createGain();
    o.connect(v); v.connect(c.destination);
    o.type = t || 'sine';
    o.frequency.setValueAtTime(f, c.currentTime + (dl||0));
    v.gain.setValueAtTime(g || 0.25, c.currentTime + (dl||0));
    v.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (dl||0) + d);
    o.start(c.currentTime + (dl||0));
    o.stop(c.currentTime  + (dl||0) + d + 0.01);
  } catch(e) {}
}
function playSound(type) {
  if (G.muted) return;
  if (type==='click') { beep(440, 0.05, 0.18, 'square'); }
  if (type==='win')   { beep(523,0.10,0.25,'sine',0); beep(659,0.10,0.25,'sine',0.12); beep(784,0.20,0.30,'sine',0.24); }
  if (type==='lose')  { beep(330,0.12,0.25,'sawtooth',0); beep(246,0.20,0.25,'sawtooth',0.14); }
  if (type==='draw')  { beep(370,0.15,0.18,'triangle'); }
  if (type==='save')  { beep(523,0.08,0.2,'sine',0); beep(659,0.10,0.2,'sine',0.09); }
}
function toggleMute() {
  G.muted = !G.muted;
  document.getElementById('sound-btn').textContent = G.muted ? '🔇' : '🔊';
  savePrefs();
  toast(G.muted ? '🔇 Sound Muted' : '🔊 Sound On');
}

function toast(msg, ms) {
  var el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(function() {
    el.classList.add('out');
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
  }, ms || 2600);
}

function winRate() {
  var p = G.stats.wins + G.stats.losses;
  return p > 0 ? (G.stats.wins / p) * 100 : null;
}
function winRatePrev() {
  var p = G.stats.wins + G.stats.losses;
  return p <= 1 ? 0 : ((G.stats.wins - 1) / (p - 1)) * 100;
}

function checkAchievements(result) {
  var s = G.stats;
  if (result === 'win' && s.wins === 1) { toast('🏆 First Victory!'); return; }
  if (result === 'win' && s.streak === s.best && s.streak > 1) {
    toast('🔥 New Best Streak: ' + s.best + '!');
  }
  if (result === 'lose') {
    var ls = 0;
    for (var i = G.history.length - 1; i >= 0; i--) {
      if (G.history[i].result === 'lose') ls++; else break;
    }
    if (ls === 3) toast('⚠️ Losing Streak: 3 in a Row');
  }
  var ms = [10, 25, 50, 100];
  for (var m = 0; m < ms.length; m++) {
    if (s.total === ms[m]) { toast('🎮 ' + ms[m] + ' Games Played!'); break; }
  }
  var rate = winRate();
  if (typeof rate === 'number' && result === 'win') {
    var prev = winRatePrev();
    if      (rate >= 90 && prev < 90) toast('👑 Win Rate Above 90%!');
    else if (rate >= 75 && prev < 75) toast('🎯 Win Rate Above 75%!');
  }
}

function confetti() {
  var box = document.getElementById('confetti');
  box.innerHTML = '';
  for (var i = 0; i < 80; i++) {
    var el   = document.createElement('div');
    var size = (5 + Math.random() * 10) + 'px';
    el.className = 'cp';
    el.style.left            = (Math.random() * 100) + '%';
    el.style.width           = size;
    el.style.height          = size;
    el.style.background      = CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)];
    el.style.animationDuration      = (1.1 + Math.random() * 1.4) + 's';
    el.style.animationDelay         = (Math.random() * 0.55) + 's';
    el.style.animationFillMode      = 'forwards';
    el.style.animationTimingFunction = 'linear';
    el.style.borderRadius    = Math.random() > 0.5 ? '50%' : '3px';
    el.style.transform       = 'rotate(' + (Math.random() * 360) + 'deg)';
    box.appendChild(el);
  }
  setTimeout(function() { box.innerHTML = ''; }, 3000);
}

/* ── Game Logic (exact Python) ──
   Snake=0  Water=1  Gun=-1     */
function getResult(you, comp) {
  if (you === comp) return 'draw';
  if (comp ===  0 && you === -1) return 'win';
  if (comp ===  0 && you ===  1) return 'lose';
  if (comp ===  1 && you ===  0) return 'win';
  if (comp ===  1 && you === -1) return 'lose';
  if (comp === -1 && you ===  1) return 'win';
  if (comp === -1 && you ===  0) return 'lose';
  return 'draw';
}

function getReason(result, pk, ck) {
  if (result === 'draw') return "It's a draw — well matched!";
  var map = {
    'win:snake-water':  'Snake drinks Water 🐍💧',
    'win:water-gun':    'Water drowns Gun 💧🔫',
    'win:gun-snake':    'Gun kills Snake 🔫🐍',
    'lose:water-snake': 'Snake drinks Water 🐍💧',
    'lose:gun-water':   'Water drowns Gun 💧🔫',
    'lose:snake-gun':   'Gun kills Snake 🔫🐍'
  };
  return map[result + ':' + pk + '-' + ck] || '';
}

function play(playerKey) {
  playSound('click');

  var vals    = [-1, 0, 1];
  var compVal = vals[Math.floor(Math.random() * 3)];
  var compKey = VAL_KEY[String(compVal)];
  var result  = getResult(CHOICES[playerKey].value, compVal);

  G.stats.total++;
  if (result === 'win') {
    G.stats.wins++;
    G.stats.streak++;
    if (G.stats.streak > G.stats.best) G.stats.best = G.stats.streak;
  } else if (result === 'lose') {
    G.stats.losses++;
    G.stats.streak = 0;
  } else {
    G.stats.draws++;
  }

  /* Keep last 10 only */
  G.history.push({ id: G.stats.total, player: playerKey, computer: compKey, result: result });
  if (G.history.length > 10) G.history.shift();
  G.saved = false;

  if (result === 'win')  { playSound('win'); confetti(); }
  if (result === 'lose')   playSound('lose');
  if (result === 'draw')   playSound('draw');

  checkAchievements(result);
  renderResult(playerKey, compKey, result);
  renderStats();
  renderHistory();

  /* Animate result box */
  var box = document.getElementById('result-area');
  box.classList.remove('anim-shake', 'anim-pulse-win', 'anim-flash-red');
  void box.offsetWidth;
  if (result === 'win') {
    box.classList.add('anim-pulse-win');
    box.style.borderColor = 'var(--success)';
    box.style.boxShadow   = '0 0 32px rgba(34,197,94,0.25)';
  }
  if (result === 'lose') {
    box.classList.add('anim-shake');
    box.classList.add('anim-flash-red');
    box.style.borderColor = 'var(--danger)';
    box.style.boxShadow   = '0 0 32px rgba(239,68,68,0.20)';
  }
  if (result === 'draw') {
    box.style.borderColor = 'var(--draw-col)';
    box.style.boxShadow   = '';
  }
}

function renderResult(pk, ck, result) {
  var p = CHOICES[pk];
  var c = CHOICES[ck];
  var verdict  = result === 'win'  ? '🏆 YOU WIN!'  :
                 result === 'lose' ? '💀 YOU LOSE'  : '🤝 DRAW';
  var badgeCls = result === 'win'  ? 'badge-win'    :
                 result === 'lose' ? 'badge-lose'   : 'badge-draw';

  document.getElementById('result-content').innerHTML =
    '<div class="result-vs-row">' +
      '<div class="result-side">' +
        '<div class="result-side-label">You</div>' +
        '<div class="result-side-emoji">' + p.emoji + '</div>' +
        '<div class="result-side-name">'  + p.label + '</div>' +
      '</div>' +
      '<div class="result-divider">VS</div>' +
      '<div class="result-side">' +
        '<div class="result-side-label">Computer</div>' +
        '<div class="result-side-emoji">' + c.emoji + '</div>' +
        '<div class="result-side-name">'  + c.label + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="result-badge ' + badgeCls + '">' + verdict + '</div>' +
    '<div class="result-reason">' + getReason(result, pk, ck) + '</div>';
}

function animCount(el, target) {
  if (!el) return;
  var cur = parseInt(el.textContent) || 0;
  if (cur === target) { el.textContent = target; return; }
  var step = target > cur ? 1 : -1;
  var t = setInterval(function() {
    cur += step;
    el.textContent = cur;
    if (cur === target) clearInterval(t);
  }, 28);
}

function renderStats() {
  var s = G.stats;
  var played = s.wins + s.losses;
  var rate = played > 0 ? ((s.wins / played) * 100).toFixed(1) + '%' : 'N/A';

  animCount(document.getElementById('s-wins'),   s.wins);
  animCount(document.getElementById('s-losses'), s.losses);
  animCount(document.getElementById('s-draws'),  s.draws);
  animCount(document.getElementById('s-total'),  s.total);
  animCount(document.getElementById('s-streak'), s.streak);
  animCount(document.getElementById('s-best'),   s.best);
  document.getElementById('s-rate').textContent = rate;
}

function renderHistory() {
  var filter = document.getElementById('hist-filter').value;
  var tbody  = document.getElementById('history-body');
  var count  = document.getElementById('hist-count');

  count.textContent = '(' + G.history.length + ')';

  var list = G.history.slice().reverse().filter(function(r) {
    return filter === 'all' || r.result === filter;
  });

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="hist-empty">' +
      (G.history.length ? 'No matches for this filter.' : 'No matches yet. Start playing!') +
      '</td></tr>';
    return;
  }

  var html = '';
  for (var i = 0; i < list.length; i++) {
    var r   = list[i];
    var p   = CHOICES[r.player];
    var c   = CHOICES[r.computer];
    var lbl = r.result === 'win' ? 'WIN' : r.result === 'lose' ? 'LOSE' : 'DRAW';
    html += '<tr>' +
      '<td style="color:var(--text2);font-family:var(--font-mono);font-size:12px">' + r.id + '</td>' +
      '<td>' + p.emoji + ' ' + p.label + '</td>' +
      '<td>' + c.emoji + ' ' + c.label + '</td>' +
      '<td class="result-' + r.result + '">' + lbl + '</td>' +
    '</tr>';
  }
  tbody.innerHTML = html;
}

function showNameScreen(isChanging) {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('name-screen').classList.remove('hidden');
  document.getElementById('step-name').classList.remove('hidden');
  document.getElementById('step-continue').classList.add('hidden');

  var lbl = document.querySelector('.name-label');
  if (lbl) lbl.textContent = isChanging
    ? 'Enter a new name to reset and start fresh.'
    : 'Enter your name to begin';

  var inp = document.getElementById('name-input');
  inp.value = '';
  setTimeout(function() { inp.focus(); }, 80);
}

function showGameScreen() {
  document.getElementById('name-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('profile-player').textContent = G.name;
  renderStats();
  renderHistory();
}

function applyLoadedData(data) {
  G.stats   = data.stats   || G.stats;
  G.history = data.history || [];
}

function resetSession() {
  G.stats   = { wins:0, losses:0, draws:0, total:0, streak:0, best:0 };
  G.history = [];
  G.saved   = false;
  var area    = document.getElementById('result-area');
  var content = document.getElementById('result-content');
  if (content) content.innerHTML = '<p class="result-placeholder">Choose your weapon above to begin!</p>';
  if (area)    { area.style.borderColor = ''; area.style.boxShadow = ''; }
}

function handleNameSubmit() {
  var raw = document.getElementById('name-input').value.trim();
  if (!raw) { document.getElementById('name-input').focus(); return; }
  var name = raw.toUpperCase();

  if (G.name && G.name !== name) resetSession();
  G.name = name;

  var saved = loadProgress(name);
  if (saved) {
    document.getElementById('step-name').classList.add('hidden');
    document.getElementById('step-continue').classList.remove('hidden');
    document.getElementById('continue-name').textContent  = name;
    document.getElementById('cont-wins').textContent      = saved.stats.wins;
    document.getElementById('cont-losses').textContent    = saved.stats.losses;
    document.getElementById('cont-total').textContent     = saved.stats.total;
    document.getElementById('continue-btn')._savedData    = saved;
  } else {
    resetSession();
    showGameScreen();
  }
}

function doSave() { playSound('save'); saveProgress(); }

function newGame() {
  if (!confirm('Start a new game? All current progress will be erased.')) return;
  clearSave(G.name);
  resetSession();
  renderStats();
  renderHistory();
  toast('🆕 New Game Started');
}

window.addEventListener('DOMContentLoaded', function() {
  loadPrefs();
  applyTheme();
  document.getElementById('sound-btn').textContent = G.muted ? '🔇' : '🔊';

  showNameScreen(false);

  /* Name entry */
  document.getElementById('start-btn').addEventListener('click', handleNameSubmit);
  document.getElementById('name-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleNameSubmit();
  });

  /* Continue / Fresh start */
  document.getElementById('continue-btn').addEventListener('click', function() {
    var saved = this._savedData;
    if (saved) applyLoadedData(saved);
    G.saved = true;
    showGameScreen();
  });
  document.getElementById('new-from-continue-btn').addEventListener('click', function() {
    clearSave(G.name);
    resetSession();
    showGameScreen();
    toast('🆕 New Game Started');
  });

  /* Choice buttons */
  document.querySelectorAll('.choice-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { play(btn.dataset.choice); });
  });

  /* Keyboard shortcuts */
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    var k      = e.key.toLowerCase();
    var inGame = !document.getElementById('game-screen').classList.contains('hidden');
    if (inGame) {
      if (k === 's') play('snake');
      if (k === 'w') play('water');
      if (k === 'g') play('gun');
      if (k === 'n') newGame();
      if (k === 'm') toggleMute();
    }
    if (e.key === 'Escape') document.getElementById('rules-modal').classList.remove('open');
  });

  /* Header */
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);
  document.getElementById('sound-btn').addEventListener('click', toggleMute);
  document.getElementById('save-btn').addEventListener('click',  doSave);
  document.getElementById('save-btn2').addEventListener('click', doSave);
  document.getElementById('new-btn').addEventListener('click',   newGame);
  document.getElementById('new-btn2').addEventListener('click',  newGame);
  document.getElementById('change-name-btn').addEventListener('click', function() {
    showNameScreen(true);
  });

  /* Rules modal */
  var modal = document.getElementById('rules-modal');
  document.getElementById('rules-btn').addEventListener('click',       function() { modal.classList.add('open'); });
  document.getElementById('modal-close').addEventListener('click',     function() { modal.classList.remove('open'); });
  document.getElementById('modal-close-btn').addEventListener('click', function() { modal.classList.remove('open'); });
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.classList.remove('open');
  });

  /* Restart score */
  document.getElementById('reset-btn').addEventListener('click', function() {
    if (!confirm('Restart all scores? Unsaved progress will be lost.')) return;
    resetSession();
    renderStats();
    renderHistory();
    toast('🔄 Scores Reset');
  });

  /* History filter */
  document.getElementById('hist-filter').addEventListener('change', renderHistory);
});