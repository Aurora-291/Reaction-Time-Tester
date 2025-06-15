const target = document.getElementById('target');
const startBtn = document.getElementById('startBtn');
const bestTimeElement = document.getElementById('bestTime');
const themeToggle = document.getElementById('themeToggle');
const resetBtn = document.getElementById('resetBtn');
const avgTimeElement = document.getElementById('avgTime');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');

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

const darkModeSaved = localStorage.getItem('darkMode');
if (darkModeSaved === 'true') {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
}

function startGame() {
    gameActive = true;
    startBtn.disabled = true;
    
    const delay = 1000 + Math.random() * 4000;
    setTimeout(() => {
        target.style.background = 'green';
        startTime = Date.now();
    }, delay);
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
    if (!gameActive || !startTime) return;
    
    const reactionTime = Date.now() - startTime;
    updateStats(reactionTime);
    
    gameActive = false;
    startBtn.disabled = false;
    target.style.background = 'red';
    startTime = 0;
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