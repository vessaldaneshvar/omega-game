url_path = window.location.pathname.split("/")
token = url_path[url_path.length-2]

game_socket_connection = new WebSocket(
    `ws://${window.location.host}/game/data/${token}/`
)

game_socket_connection.onopen = function(e){
    console.log(e)
    // game_start(game_socket_connection)
}

game_socket_connection.onmessage = function(e){
    json_data = JSON.parse(e.data)
    message_handler(json_data)
}

game_socket_connection.onclose = function(e){
    console.log(e)
    error_handler()
}