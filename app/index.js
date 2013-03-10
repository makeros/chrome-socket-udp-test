onload = function() {
  var start = document.getElementById("start");
  var stop = document.getElementById("stop");
  var game_board = document.getElementById("js_game_board");
  var info_panel = document.getElementById("js_info-panel");

  var network_interface = document.getElementById("js_network-interface");

  // var hosts = document.getElementById("hosts");
  // var port = document.getElementById("port");
  // var directory = document.getElementById("directory");

  var socket = chrome.experimental.socket || chrome.socket;
  var socketInfo;

  var clientSocket,
      clientSocketSend;


  var _CLIENT_ID = Math.floor((Math.random()*1000000)+1);

  var SERVER_ADDRESS = '192.168.66.7',
      SERVER_PORT = 40000;


  var cords = {
    x: 0,
    y: 0
  };

  var cords_server = {x:0, y:0};

/** BEGIN function data handle */

  var str2buf = function(str) {
    var buf=new ArrayBuffer(str.length);
    var bufView=new Uint8Array(buf);

    for (var i=0; i<str.length; i++) {
        bufView[i]=str.charCodeAt(i);
      }
      return buf;
  };

  var buf2str = function(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  var buf2json = function(ba){
    try{
      return JSON.parse(buf2str(ba));
    }catch(e){
      console.log('Cannot convert buffer to json!', e);
    }
  };

  var json2buf = function(json){
    try{
      return str2buf(JSON.stringify(json));
    }catch(e){
      console.log('Cannot convert string to buffer!', e);
    }
  };

/** END function data handle */

var initNewPlayer = function(player_data){
  // console.log('player data: ', player_data);
  var player = document.createElement('div');
  player.className += " player-box";
  player.id = "player_"+player_data.id;

  game_board.appendChild(player);
  // console.log('create new player');

};
/**
 * Drawing
 */
  var actual_players = 0;
  var drawPlayers = function(world_data){
    var players_in_world = Object.keys(world_data).length;

    // console.log('world_data', players_in_world);
    if(( players_in_world > actual_players) || actual_players == 0 ) {

      for(var p in world_data){
        initNewPlayer(world_data[p]);
        actual_players++;
      }


    }

    for(var client in world_data){
      // console.log('world clients: ',world_data[client]);
      var p = document.getElementById('player_'+world_data[client].id);
      p.style.top = world_data[client].data.y+'px';
      p.style.left = world_data[client].data.x+'px';
    }
  };

  var sendMouseEvents = function(event){
    cords.x = event.clientX - game_board.offsetLeft;
    cords.y = event.clientY - game_board.offsetTop;

    info_panel.innerHTML = 'x: '+ cords.x +', y: '+ cords.y;

    var json = {clientId: _CLIENT_ID, method : 'client send data', data: cords};

    if(clientSocket){
      socket.sendTo(clientSocket, json2buf(json), SERVER_ADDRESS, SERVER_PORT, function(result){

      });
    }
  };

  /**
   * [recvEvents description]
   * receives world information from server with an interval
   */
  // var intervalReceive;

  // var recvEvents = function(){

  //   intervalReceive = setInterval(function(){
  //     // console.log('clientSocket: ', clientSocket);

  //     var json = {clientId: _CLIENT_ID, method: 'client get data'};

  //     // socket.write(clientSocket, json2buf(json), function(result){
  //     // });

  //     socket.recvFrom(clientSocket,1024, function(result){
  //         console.log('recvFrom from server: ',result, buf2json(result.data) );
  //         var server_data = buf2json(result.data);

  //         //drawPlayers(server_data);
  //     });

  //   },_DATA_THROTTLE);
  // };

  var recvFromServer = function(){
    socket.recvFrom(clientSocket,1024, function(result){
        // console.log('recvFrom from server: ',result, buf2json(result.data) );
        var server_data = buf2json(result.data);

        drawPlayers(server_data);

        recvFromServer();
    });
  };



  start.onclick = function() {

      // socket waiting for data from server
      socket.create('udp', function(createInfo){

          console.log(createInfo);
          clientSocket = createInfo.socketId;

          // socket.connect(clientSocket, SERVER_ADDRESS, SERVER_PORT, function(result){
          //   console.log(result);
          //     console.log('chrome.socket.connect: result = ' + result.toString());
          // });
          var net_list = null
          chrome.socket.getNetworkList(function(list){
            console.log(list);
            net_list = list;

            socket.bind(clientSocket, net_list[network_interface.value].address, 40001,  function(result){
              console.log('bind', result);
              recvFromServer();
            });

            var hello_msg = {clientId: _CLIENT_ID, method: 'client hello'};
            socket.sendTo(clientSocket, json2buf(hello_msg),SERVER_ADDRESS, SERVER_PORT, function(writeInfo){
                console.log('writeInfo: ' + writeInfo.bytesWritten + 'byte(s) written.', writeInfo);

            });

          });


          // recvEvents();
      });

      // socket.create('udp', function(createInfo){

      //   clientSocketSend = createInfo.socketId;

      //   socket.connect(clientSocketSend, SERVER_ADDRESS, SERVER_PORT, function(result){
      //       console.log(result);
      //         console.log('send chrome.socket.connect: result = ' + result.toString());
      //   });

      // });

  };


  stop.onclick = function(){

    socket.destroy(clientSocket);
    clientSocket = null;

  };

  game_board.onmousemove = sendMouseEvents;

};