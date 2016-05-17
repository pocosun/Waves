var utils = require('./public/javascripts/utils.js')
var socketio = require('socket.io');
var io = socketio();

io.sockets.on("connection", function(socket) {
	console.log("Connection detected");
	//utils.makePackage({'first': 'Taylor Swift', 'second': 'Kelly Clarkson'}, socket);

	socket.on('similarArtist', function(data){
        console.log("Searching...");
		utils.makeSimilar(data, socket);
	});
	socket.on('tracks', function(data){
		console.log('Searching for track...')
		utils.getTrack(data.id, socket);
	})

	socket.on('pictures', function(data){
		utils.getPictures(data, socket);
	})
});

module.exports = io;