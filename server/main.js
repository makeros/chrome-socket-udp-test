var dgram = require("dgram");

var server = dgram.createSocket("udp4");
// server.setMulticastTTL(128);
// server.addMembership('192.168.66.7') ;

var msg;

var clients = {};

var server_cords = {};

var _DATA_THROTTLE = 16;

/** BEGIN function data handle */
  // var ab2str = function(buffer) {
  //   var str = '';
  //   var uArrayVal = new Uint8Array(buffer);
  //   for(var s = 0; s < uArrayVal.length; s++) {
  //     str += String.fromCharCode(uArrayVal[s]);
  //   }
  //   return str;
  // };

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

var sendEventsToClient = function(clientId, msg){

	var buf = json2buf(msg);
	// console.log(clients);
	// for( var cIndex in clients){
	// server.send(buf, 0, buf.length, /*clients[clientId].clientInfo.port*/400001, clients[clientId].clientInfo.address, function(err, bytes) {
	// 	console.log('send to '+ clients[clientId].clientInfo.address + ' ' + clients[clientId].clientInfo.port +'message: ', buf);
	// });



	// }
	//console.log('send: ',msg, clients);
};

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
	// console.log(json_msg,rinfo);
	// var client_id = rinfo.address+rinfo.port.toString();

	if(json_msg.method == 'client hello'){

		clients[json_msg.clientId] = {clientInfo: rinfo};
		server_cords[json_msg.clientId] = {id: json_msg.clientId, data: {}};

		actual_users++;

	}

	// if(json_msg.method == 'client get data'){

	// 		sendEventsToClient(json_msg.clientId, server_cords);
	// }

	if(json_msg.method == 'client send data'){
		server_cords[json_msg.clientId].data = json_msg.data;
	}


	// console.log("server got: " + msg );
	// console.log('server_cords: ', server_cords);



});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " + address.address + ":" + address.port);
});

server.bind(40000);