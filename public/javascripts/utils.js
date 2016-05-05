var rovi = require('rovijs'),
	echo = require('echonestjs'),
	spotifyAPI = require('spotify-web-api-node'),
	async = require('async'),
	discogs = require("disconnect").Client,
	config = require('./config/config.js')

//initializing the Rovi and Echo keys
rovi.init(config.rovi.key, config.rovi.secret);
echo.init(config.echo.key);
var dis = new discogs({userToken: 'xQSstXxQtGrcxUDRGSHJYjshQcuqYgbsBQlMKagH'});

var spotify = new spotifyAPI({
	clientId: config.spotify.clientId,
	clientSecret: config.spotify.secret
});

var db = dis.database();

//finds the influeners using rovi
var findInflu = function(data, callback){
	rovi.get("name/influencers", { "name": data}, function (err, res) {
		if(err){
			console.error("influence not found");
			callback(err);
		}
		else{
			callback(null, res.influencers[0].name);
		}
	});
	
};

//finds similarities using echonest
var findSimilar = function(data, callback){
	var artistnames = [data.first, data.second];

	echo.get("artist/similar", {"name": artistnames }, function (err, res) {
		if(err){
			console.error("similar artist not found");
			console.log(err);
		}
		else{
			console.log(res.response.artists[1]);
			callback(null, res.response.artists[1]);
		}
	});
	
};

//Find Images for artist using discogs
//Currently only logs images
var findPhoto = function(data, callback){
	db.search(data, {'type': 'artist'}, function(err, data){

		db.artist(data.results[0].id, function(err, data2) {
		   if(err){
				console.error("photo not found");
				console.log(err);
			}
			else{
				var imgArray = data2.images.map(function (img) {
					return {'url': img.resource_url}
				});
				callback(null, imgArray);
			}
		}); 
	});		
};

//Finds video for artist
//A regular URL is returned from API services so we need to replace the URL to add the "embed" to make it website friendly
//Will need to check for all video sources (youtube, dailymotion, etc)
//Possible more effiecient way?
var findVideo = function(data, callback){
	echo.get("artist/video", { "name": data}, function (err, res) {
		if(err){
			console.error("video not found");
			console.log(err);
		}
		else{
			var oURL = res.response.video[0] ? res.response.video[0].url : "";
			var nURL = oURL.replace("http://www.dailymotion.com/", "http://www.dailymotion.com/embed/");
			
			callback(null, nURL);

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
					console.log(res.body.items[0].images);
					var imgArray = res.body.items.map(function (img) {
						if(img.images[0]){
							return {'url': img.images[0].url}
						}
						else{
							return {'url' : ''}
						}
					});
					console.log(imgArray);
					callback(null, imgArray);				
				}
			});
		}
	});
}

//Finds song for artist  using Spotify
var findSong = function(data, callback){
	findArtistId(data, function(err, res){
		if (err){
			console.log('ID Error: ' + err);
		}
		else{
			spotify.getArtistTopTracks(res, 'US', function(err, res){
				if (err){
					console.log('Song Error: ' + err);
				}
				else{
					spotify.getTrack(res.body.tracks[0].id, function(err, res){
						if (err){
							console.log('Song Error: ' + err);
						}
						else{
							console.log("Song found for " + data);
							callback(null, res.body.preview_url);
						}
					});
				}
			});
		}
	});
}


//Calls each helper function and makes it into a single object called datapackage
var makePackage = function(data, socket){
	var dataPackage = {
		first: {
			name: data.first,
			images: [],
			albums: []
		},
		second: {
			name: data.second,
			images: [],
			albums: []
		},
		similar: {
			name: '',
			images: [],
			albums: [],
			song: []
		}
	};

	//Async.js allows us to call multiple async functions at once 
	//and then wait for a reply from all of them before continuing
	async.parallel(
		{
			firstImg: function(callback){
				findPhoto(data.first, callback);
			},
			secondImg: function(callback){
				findPhoto(data.second, callback);
			},
			firstAlbumArt: function(callback){
				findAlbumArt(data.first, callback);
			},
			secondAlbumArt: function(callback){
				findAlbumArt(data.second, callback);
			},
			similar: function(callback){
				findSimilar(data, callback);
			}
		},
		function(err, results){
			if (err){
				console.log('First Sync Error: ' + err);
			}
			console.log("First async succeeded");

			dataPackage.first.images = results.firstImg;
			dataPackage.second.images = results.secondImg;

			dataPackage.first.albums = results.firstAlbumArt;
			dataPackage.second.albums = results.secondAlbumArt;

			dataPackage.similar.name = results.similar.name;

			async.parallel(
				{
					similarImg: function(callback){
						findPhoto(results.similar.name, callback);
					},
					similarAlbumArt: function(callback){
						findAlbumArt(results.similar.name, callback);
					},
					similarSong: function(callback){
						findSong(results.similar.name, callback);
					}
				},
				function(err,results){
					if (err){
						console.log('Second Sync Error: ' + err);
					}
					console.log("Second Async succeeded");
					dataPackage.similar.images = results.similarImg;
					dataPackage.similar.song = results.similarSong;
					dataPackage.similar.albums = results.similarAlbumArt;

					dataPackage.similar.song = results.similarSong;
					
					socket.emit('package', dataPackage);
				}
			);
		}
	);
};

module.exports.makePackage = makePackage;