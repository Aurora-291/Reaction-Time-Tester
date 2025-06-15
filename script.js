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

const modeColors = {
    classic: '#FF4081',
    countdown: '#2196F3',
    chain: '#4CAF50',
    precision: '#9C27B0',
    memory: '#FF9800',
    moving: '#00BCD4'
};

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});

function startClassicMode() {
    const settings = difficultySettings[currentDifficulty];
    target.style.background = modeColors.classic;
    target.innerHTML = '';
    target.style.width = `${settings.targetSize}px`;
    target.style.height = `${settings.targetSize}px`;
    
    const delay = settings.minDelay + Math.random() * (settings.maxDelay - settings.minDelay);
    setTimeout(() => {
        target.style.background = '#00ff00';
        target.classList.add('target-pulse');
        startTime = Date.now();
        playSound('start');
        setTimeout(() => target.classList.remove('target-pulse'), 500);
    }, delay);
}

function startCountdownMode() {
    const settings = difficultySettings[currentDifficulty];
    let count = 3;
    target.innerHTML = count;
    target.style.background = modeColors.countdown;
    target.style.width = `${settings.targetSize}px`;
    target.style.height = `${settings.targetSize}px`;
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            target.innerHTML = count;
        } else {
            clearInterval(interval);
            target.innerHTML = '';
            target.style.background = '#00ff00';
            target.classList.add('target-pulse');
            startTime = Date.now();
            playSound('start');
            setTimeout(() => target.classList.remove('target-pulse'), 500);
        }
    }, 1000);
}

function startPrecisionMode() {
    const settings = difficultySettings[currentDifficulty];
    target.style.width = `${Math.max(settings.targetSize - 20, 15)}px`;
    target.style.height = `${Math.max(settings.targetSize - 20, 15)}px`;
    target.style.background = modeColors.precision;
    target.innerHTML = '<i class="fas fa-crosshairs"></i>';
    startTime = Date.now();
    playSound('start');
}

function getRandomPosition() {
    const gameRect = document.getElementById('game-area').getBoundingClientRect();
    const targetSize = parseInt(target.style.width);
    const maxX = gameRect.width - targetSize;
    const maxY = gameRect.height - targetSize;
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
    totalAttempts++;
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
            target.style.width = `${difficultySettings[currentDifficulty].targetSize}px`;
            target.style.height = `${difficultySettings[currentDifficulty].targetSize}px`;
            startTime = Date.now();
            playSound('start');
            break;
        case 'precision':
            startPrecisionMode();
            break;
    }
}

function updateStats(reactionTime) {
    if (typeof reactionTime === 'number') {
        successfulAttempts++;
        
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
        
        const accuracy = Math.round((successfulAttempts / totalAttempts) * 100);
        accuracyElement.textContent = `${accuracy}%`;
        attemptsElement.textContent = totalAttempts;
        
        showFeedback(reactionTime);
        playSound('success');
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

resetBtn.addEventListener('click', () => {
    times = [];
    bestTime = Infinity;
    streak = 0;
    score = 0;
    totalAttempts = 0;
    successfulAttempts = 0;
    bestTimeElement.textContent = '---';
    avgTimeElement.textContent = '---';
    scoreElement.textContent = '0';
    streakElement.textContent = '0';
    accuracyElement.textContent = '100%';
    attemptsElement.textContent = '0';
});

startBtn.addEventListener('click', startGame);

loadSettings();