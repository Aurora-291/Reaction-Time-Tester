const target = document.getElementById('target');
const startBtn = document.getElementById('startBtn');
const bestTimeElement = document.getElementById('bestTime');
const themeToggle = document.getElementById('themeToggle');
const resetBtn = document.getElementById('resetBtn');
const avgTimeElement = document.getElementById('avgTime');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const modeBtns = document.querySelectorAll('.mode-btn');
const currentModeElement = document.getElementById('currentMode');
let currentMode = 'classic';
let chainCount = 0;

let times = [];
let streak = 0;
let score = 0;

let gameActive = false;
let startTime = 0;
let bestTime = Infinity;

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});

const modeColors = {
    classic: '#FF4081',
    countdown: '#2196F3',
    chain: '#4CAF50',
    precision: '#9C27B0'
};

function startClassicMode() {
    target.style.background = modeColors.classic;
    target.innerHTML = '';
    const delay = 1000 + Math.random() * 4000;
    setTimeout(() => {
        target.style.background = '#00ff00';
        startTime = Date.now();
    }, delay);
}

function startCountdownMode() {
    let count = 3;
    target.innerHTML = count;
    target.style.background = modeColors.countdown;
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            target.innerHTML = count;
        } else {
            clearInterval(interval);
            target.innerHTML = '';
            target.style.background = '#00ff00';
            startTime = Date.now();
        }
    }, 1000);
}

function startPrecisionMode() {
    target.style.width = '40px';
    target.style.height = '40px';
    target.style.background = modeColors.precision;
    target.innerHTML = '<i class="fas fa-crosshairs"></i>';
    startTime = Date.now();
}

function getRandomPosition() {
    const gameRect = document.getElementById('game-area').getBoundingClientRect();
    const maxX = gameRect.width - 60;
    const maxY = gameRect.height - 60;
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

const darkModeSaved = localStorage.getItem('darkMode');
if (darkModeSaved === 'true') {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
}

function startGame() {
    gameActive = true;
    startBtn.disabled = true;
    moveTarget();
    
    switch(currentMode) {
        case 'classic':
            startClassicMode();
            break;
        case 'countdown':
            startCountdownMode();
            break;
        case 'chain':
            chainCount = 0;
            target.innerHTML = chainCount;
            target.style.background = modeColors.chain;
            startTime = Date.now();
            break;
        case 'precision':
            startPrecisionMode();
            break;
    }
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
        } else {
            streak = 0;
        }
        streakElement.textContent = streak;
        scoreElement.textContent = score;
    }
}

target.addEventListener('click', () => {
    if (!gameActive) return;
    
    if (currentMode === 'chain') {
        chainCount++;
        target.innerHTML = chainCount;
        if (chainCount >= 5) {
            const avgTime = Math.round((Date.now() - startTime) / 5);
            updateStats(avgTime);
            gameActive = false;
            startBtn.disabled = false;
        } else {
            moveTarget();
        }
        return;
    }
    
    if (!startTime) return;
    
    const reactionTime = Date.now() - startTime;
    updateStats(reactionTime);
    
    gameActive = false;
    startBtn.disabled = false;
    target.style.background = modeColors[currentMode];
    startTime = 0;
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        currentModeElement.textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
        
        target.style.width = '60px';
        target.style.height = '60px';
        target.style.background = modeColors[currentMode];
    });
});

resetBtn.addEventListener('click', () => {
    times = [];
    bestTime = Infinity;
    streak = 0;
    score = 0;
    bestTimeElement.textContent = '---';
    avgTimeElement.textContent = '---';
    scoreElement.textContent = '0';
    streakElement.textContent = '0';
});

startBtn.addEventListener('click', startGame);