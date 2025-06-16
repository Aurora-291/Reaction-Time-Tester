const target = document.getElementById('target');
const gameArea = document.getElementById('game-area');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const shareBtn = document.getElementById('shareBtn');
const bestTimeElement = document.getElementById('bestTime');
const avgTimeElement = document.getElementById('avgTime');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const xpElement = document.getElementById('xp');
const themeToggle = document.getElementById('themeToggle');
const modeBtns = document.querySelectorAll('.mode-btn');
const currentModeElement = document.getElementById('currentMode');
const countdownElement = document.getElementById('countdown');
const timerElement = document.getElementById('timer');
const comboMeter = document.getElementById('combo-meter');

let gameActive = false;
let startTime = 0;
let timeoutId = null;
let bestTime = Infinity;
let times = [];
let streak = 0;
let score = 0;
let xp = 0;
let currentMode = 'classic';
let timerInterval = null;
let chainCount = 0;
let combo = 0;
let allModesIndex = 0;
let allModes = ['classic', 'countdown', 'chain', 'precision', 'random'];

const modeColors = {
    classic: '#FF4081',
    countdown: '#2196F3',
    chain: '#4CAF50',
    precision: '#9C27B0',
    random: '#FF9800'
};

function updateTimer() {
    if (startTime && gameActive) {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) / 1000;
        timerElement.textContent = elapsedTime.toFixed(3) + 's';
    }
}

function startTimer() {
    timerInterval = setInterval(updateTimer, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function createParticle(x, y, color) {
    const particles = document.getElementById('particles');
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = color;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        const angle = (Math.random() * 360) * Math.PI / 180;
        const velocity = Math.random() * 100 + 50;
        const lifetime = Math.random() * 500 + 500;
        particle.style.transform = `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px)`;
        particle.style.transition = `transform ${lifetime}ms linear, opacity ${lifetime}ms linear`;
        particle.style.opacity = '0';
        particles.appendChild(particle);
        setTimeout(() => particle.remove(), lifetime);
    }
}

function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    gameArea.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function updateCombo(success) {
    if (success) {
        combo++;
        if (combo > 2) {
            comboMeter.style.opacity = '1';
            comboMeter.textContent = `Combo x${combo}`;
        }
    } else {
        combo = 0;
        comboMeter.style.opacity = '0';
    }
}

function startCountdownMode() {
    let count = 3;
    countdownElement.textContent = count;
    countdownElement.classList.add('fade-in');
    target.style.background = modeColors.countdown;
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownElement.textContent = count;
        } else {
            clearInterval(interval);
            countdownElement.classList.remove('fade-in');
            target.style.background = '#00ff00';
            startTime = Date.now();
            startTimer();
        }
    }, 1000);
}

function startPrecisionMode() {
    target.style.width = '40px';
    target.style.height = '40px';
    target.style.background = modeColors.precision;
    target.innerHTML = '<i class="fas fa-crosshairs"></i>';
    startTime = Date.now();
    startTimer();
}

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});

const darkModeSaved = localStorage.getItem('darkMode');
if (darkModeSaved === 'true') {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
}

function updateStats(reactionTime) {
    if (typeof reactionTime === 'number') {
        if (reactionTime < bestTime) {
            bestTime = reactionTime;
            bestTimeElement.textContent = `${reactionTime}ms`;
        }
        times.push(reactionTime);
        const avg = times.reduce((a, b) => a + b) / times.length;
        avgTimeElement.textContent = `${Math.round(avg)}ms`;
        if (reactionTime < 300) {
            streak++;
            score += streak * 10;
            xp += 10;
        } else {
            streak = 0;
        }
        streakElement.textContent = streak;
        scoreElement.textContent = score;
        xpElement.textContent = xp;
    }
}

function getRandomPosition() {
    const targetRect = target.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    const maxX = gameRect.width - targetRect.width;
    const maxY = gameRect.height - targetRect.height;
    return {
        x: Math.random() * maxX,
        y: Math.random() * maxY
    };
}

function moveTarget() {
    const pos = getRandomPosition();
    target.style.left = `${pos.x}px`;
    target.style.top = `${pos.y}px`;
}

function startGame() {
    gameActive = true;
    startBtn.disabled = true;
    target.style.background = modeColors[currentMode];
    moveTarget();
    
    const delay = 1000 + Math.random() * 4000;
    timeoutId = setTimeout(() => {
        target.style.background = '#00ff00';
        startTime = Date.now();
        startTimer();
    }, delay);
}

function endGame(reactionTime) {
    gameActive = false;
    clearTimeout(timeoutId);
    startBtn.disabled = false;
    stopTimer();
    updateStats(reactionTime);
}

target.addEventListener('click', (e) => {
    if (!gameActive) return;
    
    const rect = target.getBoundingClientRect();
    createParticle(e.clientX - rect.left, e.clientY - rect.top, getComputedStyle(target).backgroundColor);
    createRipple(e.clientX - rect.left, e.clientY - rect.top);
    
    if (currentMode === 'chain') {
        chainCount++;
        target.textContent = chainCount;
        if (chainCount >= 5) {
            const avgTime = Math.round((Date.now() - startTime) / 5);
            endGame(avgTime);
        } else {
            moveTarget();
        }
        return;
    }
    
    if (!startTime) {
        endGame('Too early!');
        return;
    }
    
    const reactionTime = Date.now() - startTime;
    endGame(reactionTime);
});

startBtn.addEventListener('click', startGame);

resetBtn.addEventListener('click', () => {
    times = [];
    bestTime = Infinity;
    streak = 0;
    score = 0;
    xp = 0;
    updateStats();
});

shareBtn.addEventListener('click', () => {
    const text = `My Reaction Time: ${bestTimeElement.textContent}\nScore: ${score}`;
    if (navigator.share) {
        navigator.share({
            title: 'Reaction Time Test',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text);
    }
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        currentModeElement.textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
        target.style.background = modeColors[currentMode];
    });
});

target.style.background = modeColors[currentMode];