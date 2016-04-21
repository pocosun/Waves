var express = require('express');
var router = express.Router();
var controllers = require('../controllers');


var router = function(app){

	app.get("/login", controllers.Account.loginPage);
	app.post("/login", controllers.Account.login);

	app.get("/signup", controllers.Account.signupPage);
	app.post("/signup", controllers.Account.signup);

	app.get("/account", controllers.Account.accountPage);
	app.get("/users", controllers.Account.userList);

	app.get("/userPage", controllers.Account.userPage);

	app.get("/logout", controllers.Account.logout);
	app.get("/", controllers.Account.loginPage);

};


module.exports = router;
