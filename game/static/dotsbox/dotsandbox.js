const statusDisplay = document.querySelector('#status');
const player_show = document.querySelector('#player-show');
const score_m = document.querySelector('#score-m');
const score_c = document.querySelector('#score-c');

const conErrorMessage = () => `ارتباط با سرور برقرار نشد.
به صفحه ایجاد گروه بازگردید و مجددا گروه تشکیل دهید.`

let UserPlayer = ""
let UserIndex;
let Cur_player;
let gameActive = true;
let gameState = ["", ""];

var player_color = [
    "#522745",
    "#FC6666",
    "#0F80FF"
];

var nb_cols = 7;
var nb_rows = 5;
var data = new Array(0);
var points = [0, 0, 0];
var timelimit = 0.5;
var cur_ended = false;
var agents = {
    1: {
        "active": true
    },

    2: {
        "active": true
    }
}

var field_margin = 10;
var cell_width = 40;
var cell_margin = 6;
var player_height = 40;
var width = 300;
var height = 300;
var line_width = 7;



var svg = d3.select("#dotsandboxes").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + field_margin + "," + field_margin + ")");

var player = svg.append("g")
    .attr("class", "player")
    .attr("transform", "translate(0,10)");

var field = svg.append("g")
    .attr("class", "field")
    .attr("transform", "translate(0," + player_height + ")");



function update_board() {
    // ROWS - enter & update
    var rows = field.selectAll(".row")
        .data(data)
        .attr("fill", function () { return null; });

    rows.exit().remove();

    rows = rows.enter().append("g")
        .attr("class", "row")
        .attr("transform", function (row, i) { return "translate(0," + cell_width * i + ")"; })
        .merge(rows);

    // COLS - enter & update
    var cols = rows.selectAll(".col")
        .data(function (col) { return col; });

    cols.exit().remove();

    var cols_enter = cols.enter().append("g")
        .attr("class", "col")
        .attr("transform", function (col, ri) { return "translate(" + cell_width * ri + ",0)"; });

    // CELL - enter
    cols_enter.append("rect")
        .attr("class", "cell")
        .attr("rx", cell_margin)
        .attr("ry", cell_margin)
        .attr("opacity", 0.35)
        .attr("x", cell_margin)
        .attr("y", cell_margin)
        .attr("width", cell_width - 2 * cell_margin)
        .attr("height", cell_width - 2 * cell_margin);

    // HLINE - enter
    cols_enter.append("line")
        .attr("class", "hline")
        .attr("x1", function (cell, ci) { return cell_margin; })
        .attr("x2", function (cell, ci) { return cell_width - cell_margin; })
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke-linecap", "round")
        .attr("stroke", function (cell) { return player_color[cell.t]; });

    cols_enter.append("path")
        .attr("d", "M" + cell_margin + ",0" +
            "L" + (cell_width / 2) + ",-" + (cell_width / 3) +
            "L" + (cell_width - cell_margin) + ",0" +
            "L" + (cell_width / 2) + "," + (cell_width / 3) + "Z")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("opacity", "0")
        .on("click", function (cell) {
            if (agents[Cur_player].active == true) {
                console.log("Ignoring click, automated agent")
            } else {
                user_click(cell, "h");
            }
        });

    // VLINE - enter
    cols_enter.append("line")
        .attr("class", "vline")
        .attr("y1", function (cell, ci) { return cell_margin; })
        .attr("y2", function (cell, ci) { return cell_width - cell_margin; })
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("stroke-linecap", "round")
        .attr("stroke", function (cell) { return player_color[cell.l]; });

    cols_enter.append("path")
        .attr("d", "M0," + cell_margin +
            "L-" + (cell_width / 3) + "," + (cell_width / 2) +
            "L0," + (cell_width - cell_margin) +
            "L" + (cell_width / 3) + "," + (cell_width / 2) + "Z")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("opacity", "0")
        .on("click", function (cell) {
            if (agents[Cur_player].active == true) {
                console.log("Ignoring click, automated agent");
            } else {
                user_click(cell, "v");
            }
        });

    cols = cols_enter
        .merge(cols);

    // HLINE - update
    cols.selectAll(".hline")
        .attr("stroke-width", function (cell) {
            if (typeof (cell.t) == "undefined") {
                return 0;
            }
            return line_width;
        })
        .attr("stroke", function (cell) { return player_color[cell.t]; });

    // VLINE - update
    cols.selectAll(".vline")
        .attr("stroke-width", function (cell, ci) {
            if (typeof (cell.l) == "undefined") {
                return 0;
            }
            return line_width;
        })
        .attr("stroke", function (cell) { return player_color[cell.l]; });

    // CELL - update
    cols.selectAll(".cell")
        .attr("fill", function (cell) {
            if (cell.p == undefined) {
                return "white";
            }
            return player_color[cell.p];
        });
}

function startgame() {
    var old_length = 0;
    for (var ri = 0; ri < nb_rows + 1; ri++) {
        if (ri >= data.length) {
            data.push(new Array(0));
        }
        var row = data[ri];
        for (var ci = 0; ci < nb_cols + 1; ci++) {
            if (ci >= row.length) {
                row.push({ l: 0, t: 0, p: 0, r: 0, c: 0 });
            }
            var l = 0;
            var t = 0;
            var p = 0;
            if (ri == nb_rows) {
                l = undefined;
                p = undefined;
            }
            if (ci == nb_cols) {
                t = undefined;
                p = undefined
            }
            var cell = row[ci];
            cell.l = l;
            cell.t = t;
            cell.p = p;
            cell.r = ri;
            cell.c = ci;
        }
        old_length = row.length;
        for (var ci = nb_cols + 1; ci < old_length; ci++) {
            row.pop();
        }
    }
    old_length = data.length;
    for (var ri = nb_rows + 1; ri < old_length; ri++) {
        data.pop();
    }
}

function error_handler(errorobject) {
    statusDisplay.innerHTML = conErrorMessage()
}


function message_handler(json_data) {
    console.log(json_data)
    if (json_data["action"] == "start_game") {
        statusDisplay.innerHTML = "بازی شروع شد. نوبت بازیکن اول می باشد."
        if (json_data["userid"] == 0) {
            UserPlayer = "بازیکن اول"
            Cur_player = 1
            agents[Cur_player].active = false
        }
        else if (json_data["userid"] == 1) {
            UserPlayer = "بازیکن دوم"
            Cur_player = 2
        }
        player_show.style.color = player_color[Cur_player];
        player_show.innerText = UserPlayer
        startgame()
        update_board()
    }
    else if (json_data["action"] == "cell_click") {
        user_click(data[json_data.location[0]][json_data.location[1]],json_data["orientation"],true)
        agents[Cur_player].active = false
    }
}

function user_click(cell, o, otheruser) {
    console.log("cell clicked", cell, o)
    var won_cell = false;
    var c = cell.c;
    var r = cell.r;

    if (o == "h") {
        if (cell.t != 0) {
            return;
        }
        cell.t = Cur_player;
        // Above
        if (r > 0) {
            if (data[r - 1][c].l != 0
                && data[r - 1][c + 1].l != 0
                && data[r - 1][c].t != 0
                && data[r][c].t != 0) {
                won_cell = true;
                points[Cur_player] += 1;
                data[r - 1][c].p = Cur_player;
            }
        }
        // Below
        if (r < nb_rows) {
            if (data[r][c].l != 0
                && data[r][c + 1].l != 0
                && data[r][c].t != 0
                && data[r + 1][c].t != 0) {
                won_cell = true;
                points[Cur_player] += 1;
                data[r][c].p = Cur_player;
            }
        }
    }

    if (o == "v") {
        if (cell.l != 0) {
            return;
        }
        cell.l = Cur_player;
        // Left
        if (c > 0) {
            if (data[r][c - 1].l != 0
                && data[r][c].l != 0
                && data[r][c - 1].t != 0
                && data[r + 1][c - 1].t != 0) {
                won_cell = true;
                points[Cur_player] += 1;
                data[r][c - 1].p = Cur_player;
            }
        }
        // Right
        if (c < nb_cols) {
            if (data[r][c].l != 0
                && data[r][c + 1].l != 0
                && data[r][c].t != 0
                && data[r + 1][c].t != 0) {
                won_cell = true;
                points[Cur_player] += 1;
                data[r][c].p = Cur_player;
            }
        }
    }
    
    // Game over
    if (points[1] + points[2] == nb_cols * nb_rows) {
        var winner = 1
        if (points[2] == points[1]) {
            winner = 0;
        }
        if (points[2] > points[1]) {
            winner = 2;
        }
        cur_ended = true;
    }
    update_board();
    agents[Cur_player].active = true
    Cur_player = 3 - Cur_player
    if (otheruser){
        return;
    }
    cell_click_send_message(r,c,o)
}

function cell_click_send_message(r,c,o) {
    message_data = {
        "message_type": "echo_other",
        "action": "cell_click",
        "player": Cur_player,
        location: [r, c],
        orientation: o

    }
    game_socket_connection.send(JSON.stringify(message_data))
}
