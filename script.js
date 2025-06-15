const target = document.getElementById('target');
const startBtn = document.getElementById('startBtn');
const bestTimeElement = document.getElementById('bestTime');

let gameActive = false;
let startTime = 0;
let bestTime = Infinity;

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