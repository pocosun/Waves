//var utils = require('./public/js/utils.js')
var socketio = require('socket.io');
var io = socketio();

io.sockets.on("connection", function(socket) {
	console.log("Connection detected");
	//utils.makePackage({'first': 'Taylor Swift', 'second': 'Kelly Clarkson'}, socket);

	socket.on('serverArtist', function(data){
        console.log("Searching...");
		utils.makePackage(data, socket);
	});
});

module.exports = io;