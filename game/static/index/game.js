groups_socket = new WebSocket(
    "ws://" + window.location.host + "/game/groups/"
)
groups_socket.onmessage = function (e) {
    console.log(e)
    data_group = JSON.parse(e.data)
    if (data_group["message_type"] == "broadcast_newgroup") {
        create_card_join(data_group)
    }
    else if (data_group["message_type"] == "ready_groups") {
        console.log(data_group)
        start_game(data_group["slug"])
    }
    else if (data_group["message_type"] == "incorrect_password") {
        console.log(data_group)
        alert("رمز عبور اشتباه می باشد.")
        window.location.reload()
    }
    else if (data_group["message_type"] == "same_group_name") {
        console.log(data_group)
        alert("نام گروه تکراری است. نام جدیدی انتخاب کنید.")
        window.location.reload()
    }
    else if (data_group["message_type"] == "broadcast_deletegroup") {
        delete_card(data_group["group_name"])
    }
}

function delete_card(groupname){
    del_group_att = document.getElementsByName(groupname)[0]
    del_group_att.remove()
}

function delete_group(event) {
    console.log(event)
    delete_group_data = {
        "message_type": "delete_group",
        "group_name": group_name,
        "game_password": game_password
    }
    groups_socket.send(JSON.stringify(delete_group_data))
}

function joingroup_button(e, group_name) {
    console.log(group_name)
    divElement = e.target.parentElement
    game_password = divElement.querySelector("#group-pass-join").value
    join_group_items = document.getElementById('div_join_group').getElementsByTagName("Button")
    for (let index = 0; index < join_group_items.length; index++) {
        join_group_items[index].disabled = true;

    }
    join_group_data = {
        "message_type": "join_group",
        "group_name": group_name,
        "game_password": game_password



    }
    groups_socket.send(JSON.stringify(join_group_data))
}

function create_card_join(group_game_data) {
    card_element = document.createElement("DIV")
    card_element.className = "row"
    card_element.setAttribute('name',group_game_data['group_name'])
    card_element.innerHTML = `<div class="col">
                    <div class="card" style="margin: 6%;">
                        <div class="card-body rounded" style="background-color: #e74c3c;">
                            <h4 class="card-title" style="color: rgb(251,251,251);">اسم گروه : ${group_game_data['group_name']}</h4>
                            <h6 class="text-muted card-subtitle mb-2">نام بازی : ${group_game_data['game_name']}</h6>
                            <h6 class="text-muted card-subtitle mb-2">ظرفیت باقی مانده : 1 عدد</h6>
                            <input class="form-control mb-2" type="text" style="margin: 0;" id="group-pass-join"
                                placeholder="رمز گروه">
                            <button class="btn btn-primary" type="button" onclick="joingroup_button(event,'${group_game_data['group_name']}');">عضو شدن در گروه</button>
                        </div>
                    </div>
                </div>`
    join_section_element = document.getElementById("div_join_group")
    first_element_join_section = join_section_element.getElementsByTagName('div')[0]
    join_section_element.insertBefore(card_element, first_element_join_section)

}
function creategroup() {
    group_name = document.getElementById("group-name").value
    game_object = document.getElementById('game-id')
    game_name = game_object[game_object.selectedIndex].text
    game_password = document.getElementById("group-pass").value
    if (group_name == "" || game_password == "") {
        alert("اسم گروه و رمز آن را به دقت وارد کنید.")
        return;
    }
    start_game_data = {
        "message_type": "create_group",
        "group_name": group_name,
        "game_name": game_name,
        "game_password": game_password
    }
    groups_socket.send(JSON.stringify(start_game_data))
    $('#modal_awaiting_join_member').modal({
        backdrop: 'static',
        keyboard: false
    })
}
function start_game(slug) {
    window.open(slug, "_self")
}
