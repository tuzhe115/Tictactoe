const statusDisplay = document.querySelector('.game--status');
const winningConditions = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12],
];
const resetScoreBtn = document.getElementById('reset-score-btn');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const modeSelection = document.getElementById('mode-selection');
const quizModal = document.getElementById('quiz-modal');
const questionText = document.getElementById('question');
const optionsDiv = document.getElementById('options');
const submitAnswerBtn = document.getElementById('submit-answer');


let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
let scores = { X: 0, O: 0 };
let isVsAI = false;
let quizQuestions = [];
let currentQuestionIndex = 0;

statusDisplay.innerHTML = `It's ${currentPlayer}'s turn`;

document.getElementById('player-vs-player').addEventListener('click', () => startGame(false));
document.getElementById('player-vs-ai').addEventListener('click', () => startGame(true));
loadQuiz();


function startGame(vsAI) {
    isVsAI = vsAI;
    loadQuiz();
    handleRestartGame();
}

function showQuiz() {
    const question = quizQuestions[currentQuestionIndex];
    questionText.textContent = question.question;

    optionsDiv.innerHTML = '';

    const allAnswers = [...question.incorrectAnswers, question.correctAnswer].sort(() => Math.random() - 0.5);

    allAnswers.forEach(answer => {
        const optionBtn = document.createElement('button');
        optionBtn.textContent = answer;
        optionBtn.addEventListener('click', () => selectOption(answer === question.correctAnswer));
        optionsDiv.appendChild(optionBtn);
    });

    quizModal.style.display = 'flex';
}

function selectOption(selectedIndex) {
    const question = quizQuestions[currentQuestionIndex];

    if (selectedIndex) {
        alert('Correct!');
        quizModal.style.display = 'none';

    } else {
        alert('Wrong Answer!');
        quizModal.style.display = 'none';
    }

}

function loadQuiz() {
    fetch('https://the-trivia-api.com/api/questions?categories=film_and_tv&limit=5&difficulty=easy') 
        .then(response => response.json())
        .then(data => {
            quizQuestions = data;
            currentQuestionIndex = 0; 
        })
        .catch(error => {
            console.error('Error loading quiz:', error);
        });
}


function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = `It's ${currentPlayer}'s turn`;
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }   

    loadQuiz();
    showQuiz();
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    if(currentPlayer == "X")
        {clickedCell.innerHTML = "<img src = 'x.png' alt = 'X' width = '100' height = '100'>";}
    else
        {clickedCell.innerHTML = "<img src = 'o.png' alt = 'O' width = '100' height = '100'>";}
}



function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i <= 9; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        let d = gameState[winCondition[3]];
        if (a === '' || b === '' || c === '' || d === '') {
            continue;
        }
        if(a === b && b === c && c === d) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = `Player ${currentPlayer} has won!`;
        updateScore();
        gameActive = false;
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = `Game ended in a draw!`;
        gameActive = false;
        return;
    }

    handlePlayerChange();
    
    if (isVsAI && currentPlayer == "O") {
        aiMove();
        handleResultValidation();
    }

}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = `It's ${currentPlayer}'s turn`;
}

function updateScore() {
    scores[currentPlayer]++;
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
}

function aiMove() {

    //Find available space
    let availableMoves = [];
    for (let i = 0; i<gameState.length; i++) {
        if (gameState[i] === "") {
            availableMoves.push(i);
        }
    }
    
    const cell = document.querySelectorAll('.cell');

    if (availableMoves.length >= 2) {
        //Randomly choose two space
        const [move1, move2] = availableMoves.sort(() => Math.random() - 0.5).slice(0, 2);
        gameState[move1] = 'O';
        cell[move1].innerHTML = "<img src = 'ai.png' alt = 'O' width = '100' height = '100'>";
        gameState[move2] = 'O';
        cell[move2].innerHTML = "<img src = 'ai.png' alt = 'O' width = '100' height = '100'>";

    } else if (availableMoves.length === 1) {
        gameState[availableMoves[0]] = 'O';
        cell[availableMoves[0]].innerHTML = "<img src = 'ai.png' alt = 'O' width = '100' height = '100'>";
    }


}

resetScoreBtn.addEventListener('click', () => {
    scores = { X: 0, O: 0 };
    scoreX.textContent = 0;
    scoreO.textContent = 0;
});

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.game--restart').addEventListener('click', handleRestartGame);

