const statusDisplay = document.querySelector('#status');
const player_show = document.querySelector('#player-show');
const score_m = document.querySelector('#score-m');
const score_c = document.querySelector('#score-c');
const round = document.querySelector('#round');

let UserPlayer = ""
let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];

const conErrorMessage = () => `ارتباط با سرور برقرار نشد.
به صفحه ایجاد گروه بازگردید و مجددا گروه تشکیل دهید.`
const winningMessage = () => `بازیکن ${currentPlayer} برنده شد.`;
const drawMessage = () => `بازی مساوی شد`;
const currentPlayerTurn = () => `نوبت بازیکن ${currentPlayer} است.`;
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function error_handler(errorobject){
    statusDisplay.innerHTML = conErrorMessage()
}

function message_handler(json_data){
    console.log(json_data)
    if (json_data["action"] == "start_game"){
        statusDisplay.innerHTML = "بازی شروع شد."
        if (json_data["userid"] == 0){
            UserPlayer = "X"

        }
        else if (json_data["userid"] == 1){
            UserPlayer = "O"
        }
        player_show.innerText = UserPlayer
        document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
    }
    if (json_data["action"] == "cell_click"){
        const clickedCellIndex = json_data["cell_index"];
        const clickedCell = document.querySelector(`#tictactoe > div > div:nth-child(${clickedCellIndex+1})`)
        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    }
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = currentPlayerTurn();
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break
        }
    }

    if (roundWon) {

        statusDisplay.innerHTML = winningMessage();
        IncreaseRound()
        if (currentPlayer == UserPlayer){
            score_m_int = parseInt(score_m.innerText)
            score_m.innerText = score_m_int + 1
        }
        else {
            score_c_int = parseInt(score_c.innerText)
            score_c.innerText = score_c_int + 1
        }
        checkactivegame()
        handleRestartGame()
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        IncreaseRound()
        checkactivegame()
        handleRestartGame()
        return;
    }

    handlePlayerChange();
}

function checkactivegame(){
    if (round.innerText == 5){
        gameActive = false
        statusDisplay.innerHTML = "اتمام بازی"
        save_score()
        finishgame()
    }
}

function finishgame(){
    window.open("/","_self")
}

function save_score(){
    score_m_int = parseInt(score_m.innerText)
    score_c_int = parseInt(score_c.innerText)
    if (score_m_int > score_c_int){
        winner = "me"
    }
    else {
        winner = "competitor"
    }
    score_data = {
        "message_type" : "save_score",
        "winner" : winner
    }
    game_socket_connection.send(JSON.stringify(score_data))
}

function IncreaseRound(){
    round_int = parseInt(round.innerText)
    round.innerText = round_int + 1
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }
    else if (currentPlayer == UserPlayer) {
        message_data = {
            "message_type" : "echo_other",
            "user" : currentPlayer,
            "action" : "cell_click",
            "cell_index" : clickedCellIndex
        }
        game_socket_connection.send(JSON.stringify(message_data))
        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    }
}
function handleRestartGame() {
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
}