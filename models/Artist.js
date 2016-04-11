var mongoose = require('mongoose');

var ArtistModel;

var ArtistSchema = new mongoose.Schema({
	name:{
		type:String,
		required: true,
	},

	owner: {
		type: mongoose.Schema.ObjectId,
		required: true,
		ref: 'Account'
	},

	createdDate: {
		type: Date,
		default: Date.now
	}
});

ArtistSchema.methods.toAPI = function(){
	return {
		name: this.name,
	};
};

ArtistSchema.statics.findByOwner = function(ownerId, callback){
	var search = {
		owner: mongoose.Types.ObjectId(ownerId)
	};

	return ArtistModel.find(search).select('name').exec(callback);
};

ArtistModel = mongoose.model('Artist', ArtistSchema);

module.exports.ArtistModel = ArtistModel;
module.exports.ArtistSchema = ArtistSchema;