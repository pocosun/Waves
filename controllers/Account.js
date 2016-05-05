var models = require('../models');

var Account = models.Account;

var accountPage = function(req, res){
	res.render('account', {user: req.session.account});
};

var userList = function(req, res){
	
	Account.AccountModel.findAllUsers(function(err, docs){
		if(err){
			console.log(err);
			return res.status(400).json({error:"Error"});
		}
		console.log(docs);
		res.render('users', {users: docs});
	});

};

var userPage = function(req, res){
	console.log(req);
	res.render('userPage', {user:req.query});
};

var loginPage = function(req, res){
	res.render('index');
};

var signupPage = function(req, res){
	res.render('signup');
};

var logout = function(req, res){
	req.session.destroy();
	res.redirect('/');
};

var login = function(req, res){

	if(!req.body.username || !req.body.pass){
		return res.status(400).json({error: "All fields are required!"});
	} 

	Account.AccountModel.authenticate(req.body.username, req.body.pass, function(err, account){
		if (err || !account){
			return res.status(400).json({error: "Wrong credentials"});
		}

		req.session.account = account.toAPI();

		res.json({redirect: '/account'});
	});
};

var signup = function(req, res){

	if(!req.body.username || !req.body.pass || !req.body.pass2){
		console.log(req.body);
		return res.status(400).json({error: "All fields are required, punk!"});
	} 

	if(req.body.pass !== req.body.pass2){
		return res.status(400).json({error: "Passwords do not match, punk!"});
	}

	Account.AccountModel.generateHash(req.body.pass, function(salt, hash){
		var accountData = {
			username:req.body.username,
			artist:req.body.artist,
			salt: salt,
			password: hash
		};

		var newAccount = new Account.AccountModel(accountData);

		newAccount.save(function(err){
			if(err){
				console.log(err);
				return res.status(400).json({error: "Error has occured"});
			}

			req.session.account = newAccount.toAPI();

			res.json({redirect: '/account'});
		});
	});
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signupPage = signupPage;
module.exports.signup = signup;
module.exports.userList = userList;
module.exports.accountPage = accountPage;
module.exports.userPage = userPage;