var echo = require('echonestjs'),
	spotifyAPI = require('spotify-web-api-node'),
	async = require('async'),
	config = require('./config/config.js')

//initializing the Echo keys
echo.init(config.echo.key);

var spotify = new spotifyAPI({
	clientId: config.spotify.clientId,
	clientSecret: config.spotify.secret
});


//finds similarities using echonest
var findSimilar = function(data, callback){
	var artistnames = [data.first, data.second];

	echo.get("artist/similar", {"name": artistnames }, function (err, res) {
		if(err){
			console.error("similar artist not found");
			console.log(err);
		}
		else{
			var rando = Math.floor(Math.random()*5);
			callback(null, res.response.artists[rando]);
		}
	});
	
};

//Helper function to turn names into spotify IDs
var findArtistId = function(data, callback){
	spotify.searchArtists(data, {type: 'artist'}, function(err, res){
		if (err){
			console.log ('ID Error: ' + err);
		}
		else{
			callback(null, res.body.artists.items[0].id);
		}
	});
}

//Find artist album art using spotify
var findAlbumArt = function(data, callback){
	findArtistId(data, function(err,res){
		if(err){
			console.log('ID Error: ' + err)
		}
		else{
			spotify.getArtistAlbums(res, 'US', function(err, res){
				if(err){
					console.log('Album Error: ' + err);
				}
				else{
					console.log("Album art found for " + data);
					var imgArray = res.body.items.map(function (img) {
						if(img.images[0]){
							return {'url': img.images[0].url}
						}
						else{
							return {'url' : ''}
						}
					});
					callback(null, imgArray);				
				}
			});
		}
	});
}

//Finds song for artist  using Spotify
var getTrack = function(data, socket){
	console.log(data);
	spotify.getAlbumTracks(data, 'US', function(err, res){
		if(err){
			console.log('Track Error: ' + err)
		}
		else{
			socket.emit('track', res.body.items[0].preview_url);
		}
	})
}

//Finds Album Art for artist using Spotify
var findAlbums = function(data, callback){
	findArtistId(data, function(err,res){
		if(err){
			console.log('ID Error: ' + err)
		}
		else{
			spotify.getArtistAlbums(res, 'US', function(err, res){
				if(err){
					console.log('Album Error: ' + err);
				}
				else{
					callback(null, res.body.items);				
				}
			});
		}
	});
}

var getPictures = function(data, socket){
	async.parallel({
		firstAlbum: function(callback){
			findAlbumArt(data.first, callback);
		},
		secondAlbum: function(callback){
			findAlbumArt(data.second, callback);
		}
	},
	function(err, results){
		if (err){
			console.log('First Sync Error: ' + err);
		}
		socket.emit('pictures', {first: results.firstAlbum[0].url, second: results.secondAlbum[0].url});
	})
}

//Calls each helper function and makes it into a single object called datapackage
var makeSimilar = function(data, socket){
	var similar = {
		name: '',
		albums: [],
	};

	async.parallel({
		similar: function(callback){
			findSimilar(data, callback);
		}
	},
	function(err, results){
		if (err){
			console.log('First Sync Error: ' + err);
		}
		similar.name = results.similar.name
		
		async.parallel({
			similarAlbums: function(callback){
				findAlbums(results.similar.name, callback);
			}
		},
		function(err,results){
			console.log(results.similarAlbums)
			var rando = Math.floor(Math.random()*results.similarAlbums.length)
			similar.albums.push(results.similarAlbums[rando]);

			rando = Math.floor(Math.random()*results.similarAlbums.length)
			similar.albums.push(results.similarAlbums[rando]);
			
			rando = Math.floor(Math.random()*results.similarAlbums.length)
			similar.albums.push(results.similarAlbums[rando]);
			socket.emit('similarArtist', similar);
		})
	})

};

module.exports.makeSimilar = makeSimilar;
module.exports.getPictures = getPictures;
module.exports.getTrack = getTrack;