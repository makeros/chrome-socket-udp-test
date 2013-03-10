var dgram = require("dgram");

var server = dgram.createSocket("udp4");


var msg;

var clients = {};

var server_cords = {};

var _DATA_THROTTLE = 16;

/** BEGIN function data handle */

  var str2buf = function(str) {
    var buf=new Buffer(str.length);
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
    return JSON.parse(buf2str);

  };

  var json2buf = function(json){
  	return str2buf(JSON.stringify(json));
  };

/** END function data handle */


var actual_users = 0;

setInterval(function(){

	if(actual_users > 0){


		var buf = json2buf(server_cords);
		for(var i in clients){
			server.send(buf, 0, buf.length, 40001, clients[i].clientInfo.address, function(err, bytes) {
				// console.log('send to :', buf);
			});
		}

	}

}, _DATA_THROTTLE);

server.on("message", function (msg, rinfo) {

	var json_msg = JSON.parse(msg);

	if(json_msg.method == 'client hello'){

		clients[json_msg.clientId] = {clientInfo: rinfo};
		server_cords[json_msg.clientId] = {id: json_msg.clientId, data: {}};

		actual_users++;

	}


	if(json_msg.method == 'client send data'){
		server_cords[json_msg.clientId].data = json_msg.data;
	}


});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " + address.address + ":" + address.port);
});

server.bind(40000);