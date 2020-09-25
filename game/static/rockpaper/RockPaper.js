const statusDisplay = document.querySelector('#status');
const player_show = document.querySelector('#player-show');
const score_m = document.querySelector('#score-m');
const score_c = document.querySelector('#score-c');
const round = document.querySelector('#round');

let UserPlayer = ""
let UserIndex;
let gameActive = true;
let gameState = ["",""];

Players_Arg = {
    0 : {
        "color" : "red"
    } , 
    1 : {
        "color" : "blue"
    }
}

const conErrorMessage = () => `ارتباط با سرور برقرار نشد.
به صفحه ایجاد گروه بازگردید و مجددا گروه تشکیل دهید.`
const winningMessage = () => `شما برنده شده اید.`;
const lostMessage = () => `حریفتان برنده شد.`;
const drawMessage = () => `بازی مساوی شد. `;
const RestartGameMessage = () => `بازی مجددا شروع شد.`;
const winningConditions = [
    ["R","S"],
    ["S","P"],
    ["P","R"],
];

function error_handler(errorobject){
    statusDisplay.innerHTML = conErrorMessage()
}

function message_handler(json_data){
    console.log(json_data)
    if (json_data["action"] == "start_game"){
        statusDisplay.innerHTML = "بازی شروع شد."
        if (json_data["userid"] == 0){
            UserPlayer = "بازیکن اول"
            UserIndex = 0

        }
        else if (json_data["userid"] == 1){
            UserPlayer = "بازیکن دوم"
            UserIndex = 1
        }
        player_show.style.color = Players_Arg[UserIndex]["color"];
        player_show.innerText = UserPlayer
        document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
    }
    if (json_data["action"] == "cell_click"){
        const clickedCellIndex = json_data["cell_index"];
        gameState[json_data["user"]] = clickedCellIndex
        handleResultValidation()
    }
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameActive = false
    clickedCell.style.color = Players_Arg[UserIndex]["color"];
    gameState[UserIndex] = clickedCellIndex
}

function handleResultValidation() {
    if (gameState.includes("")){
        return
    }
    if (gameState[0] == gameState[1]){
        result = 'draw'
    }

    else if (winningConditions[0][0] == gameState[0] && winningConditions[0][1] == gameState[1]){
        result = 0
    }

    else if (winningConditions[1][0] == gameState[0] && winningConditions[1][1] == gameState[1]){
        result = 0
    }

    else if (winningConditions[2][0] == gameState[0] && winningConditions[2][1] == gameState[1]){
        result = 0
    }
    else {
        result = 1
    }

    

    IncreaseRound()
    if (result == UserIndex) {
        statusDisplay.innerHTML = winningMessage();
        score_m_int = parseInt(score_m.innerText)
        score_m.innerText = score_m_int + 1
    }
    
    else if (result == "draw"){
        statusDisplay.innerHTML = drawMessage();
    }
    else {
        statusDisplay.innerHTML = lostMessage();
        score_c_int = parseInt(score_c.innerText)
        score_c.innerText = score_c_int + 1
    }


    changeActiveGame()
    handleRestartGame()
    
        
        
       
    
}

function changeActiveGame(){
    gameActive = true
    if (round.innerText == 15){
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
    const SelectedCell = clickedCell.getAttribute('data-cell-index');
    if (!gameActive) {
        return;
    }
    message_data = {
        "message_type" : "echo_other",
        "user" : UserIndex,
        "action" : "cell_click",
        "cell_index" : SelectedCell 
    }
    game_socket_connection.send(JSON.stringify(message_data))
    handleCellPlayed(clickedCell, SelectedCell);
    handleResultValidation();
}
function handleRestartGame() {
    gameState = ["" , ""];
    statusDisplay.innerHTML += RestartGameMessage();
    document.querySelectorAll('.cell').forEach(cell => cell.style.color = "");
}