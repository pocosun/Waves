var _ = require('underscore');
var models = require('../models');

var Artist = models.Artist;

var artistPage = function(req, res){
	
	Artist.ArtistModel.findByOwner(req.session.account._id, function(err, docs){
		if(err){
			console.log(err);
			return res.status(400).json({error:"Error"});
		}

		res.render('artist', {Artists: docs});
	});
};

var makeArtist = function(req, res){
	var ArtistData = {
		name: req.body.name,
		owner: req.session.account._id
	};

	var newArtist = new Artist.ArtistModel(ArtistData);

	newArtist.save(function(err){
		if (err){
			console.log(err);
			return res.status(400).json({error: "Error"});
		}

		res.json({redirect: '/artist'});
	});
};

module.exports.artistPage = artistPage;
module.exports.make = makeArtist;