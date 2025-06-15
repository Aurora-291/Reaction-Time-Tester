const target = document.getElementById('target');
const startBtn = document.getElementById('startBtn');
const bestTimeElement = document.getElementById('bestTime');
const themeToggle = document.getElementById('themeToggle');

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

target.addEventListener('click', () => {
    if (!gameActive || !startTime) return;
    
    const reactionTime = Date.now() - startTime;
    
    if (reactionTime < bestTime) {
        bestTime = reactionTime;
        bestTimeElement.textContent = bestTime + 'ms';
    }
    
    gameActive = false;
    startBtn.disabled = false;
    target.style.background = 'red';
    startTime = 0;
});

startBtn.addEventListener('click', startGame);