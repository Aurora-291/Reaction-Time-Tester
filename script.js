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
const countdownElement = document.getElementById('countdown');
const timerElement = document.getElementById('timer');
const modal = document.getElementById('resultModal');
const closeLevelModal = document.getElementById('closeLevelModal');
const currentModeElement = document.getElementById('currentMode');
const resultStats = document.querySelector('.result-stats');
const attemptsElement = document.getElementById('attempts');

let gameActive = false;
let startTime = 0;
let timeoutId = null;
let bestTime = Infinity;
let times = [];
let streak = 0;
let score = 0;
let currentMode = 'classic';
let chainCount = 0;
let allModesIndex = 0;
let allModes = ['classic', 'countdown', 'chain', 'precision', 'random'];
let timerInterval = null;

const modeColors = {
    classic: '#FF4081',
    countdown: '#2196F3',
    chain: '#4CAF50',
    precision: '#9C27B0',
    random: '#FF9800',
    all: '#607D8B'
};

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

function getRandomMode() {
    const modes = ['classic', 'countdown', 'chain', 'precision'];
    return modes[Math.floor(Math.random() * modes.length)];
}

function nextAllMode() {
    allModesIndex = (allModesIndex + 1) % allModes.length;
    return allModes[allModesIndex];
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
        }
        streakElement.textContent = streak;
        scoreElement.textContent = score;
    }
}

function showResult(reactionTime) {
    resultStats.innerHTML = `
        <h3>${typeof reactionTime === 'number' ? reactionTime + 'ms' : reactionTime}</h3>
        <p>Streak: ${streak}</p>
        <p>Score: ${score}</p>
    `;
    modal.style.display = 'flex';
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

function startClassicMode() {
    target.style.background = modeColors.classic;
    target.innerHTML = '';
    const delay = 1000 + Math.random() * 4000;
    timeoutId = setTimeout(() => {
        target.style.background = '#00ff00';
        target.classList.add('pulse');
        startTime = Date.now();
        startTimer();
    }, delay);
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
            target.classList.add('pulse');
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

function startRandomMode() {
    const randomMode = getRandomMode();
    currentMode = randomMode;
    currentModeElement.textContent = randomMode.charAt(0).toUpperCase() + randomMode.slice(1);
    startSelectedMode();
}

function startAllMode() {
    const nextMode = nextAllMode();
    currentMode = nextMode;
    currentModeElement.textContent = nextMode.charAt(0).toUpperCase() + nextMode.slice(1);
    startSelectedMode();
}

function startSelectedMode() {
    switch(currentMode) {
        case 'classic':
            startClassicMode();
            break;
        case 'countdown':
            startCountdownMode();
            break;
        case 'chain':
            chainCount = 0;
            target.textContent = chainCount;
            target.style.background = modeColors.chain;
            startTime = Date.now();
            startTimer();
            break;
        case 'precision':
            startPrecisionMode();
            break;
    }
}

function startGame() {
    gameActive = true;
    startBtn.disabled = true;
    target.classList.remove('pulse');
    moveTarget();
    if (currentMode === 'random') {
        startRandomMode();
    } else if (currentMode === 'all') {
        startAllMode();
    } else {
        startSelectedMode();
    }
}

function endGame(reactionTime) {
    gameActive = false;
    clearTimeout(timeoutId);
    startBtn.disabled = false;
    target.classList.remove('pulse');
    stopTimer();
    updateStats(reactionTime);
    showResult(reactionTime);
    if (currentMode === 'all' && typeof reactionTime === 'number') {
        setTimeout(() => {
            if (!gameActive) startGame();
        }, 2000);
    }
}

function shareResult() {
    const text = `My Pro Reaction Master stats:\nBest Time: ${bestTimeElement.textContent}\nScore: ${score}\nStreak: ${streak}\nLevel: ${level}\nPlay now!`;
    if (navigator.share) {
        navigator.share({
            title: 'Pro Reaction Timer',
            text: text
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(text)
            .then(() => alert('Stats copied to clipboard!'))
            .catch(console.error);
    }
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
shareBtn.addEventListener('click', shareResult);

resetBtn.addEventListener('click', () => {
    times = [];
    bestTime = Infinity;
    streak = 0;
    score = 0;
    chainCount = 0;
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        currentModeElement.textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
        
        if (gameActive) {
            gameActive = false;
            clearTimeout(timeoutId);
            stopTimer();
            startBtn.disabled = false;
            target.classList.remove('pulse');
        }
        
        target.style.width = '60px';
        target.style.height = '60px';
        target.style.background = modeColors[currentMode];
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !startBtn.disabled) {
        e.preventDefault();
        startGame();
    } else if (e.code === 'Escape') {
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    }
});

let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;
    if (diff < 0 && window.scrollY === 0) {
        e.preventDefault();
    }
}, { passive: false });

function initGame() {
    target.style.background = modeColors[currentMode];
    
    const updateGameAreaSize = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    updateGameAreaSize();
    window.addEventListener('resize', updateGameAreaSize);
}

initGame();