var validator = require('validator');

var validateMiddleware = 
{
	validateUserRegister: (req, res, next) => 
	{
		var name = req.body.name;
		var email = req.body.email;
		var password = req.body.password;
		
		//use validator library to do checks
		validatePass = validator.isAlphanumeric(name) && validator.isEmail(email) && validator.isAlphanumeric(password) && password.length > 7;
		
		if(validatePass)
		{
			next();
		}
		else
		{
			res.status(500).json({ message: "User register input validation failed for values of json keys provided."});
		}
	},

	validateUserLogin: (req, res, next) =>
	{
		var email = req.body.email;
		var password = req.body.password;
		
		//use validator library to do checks
		validatePass = validator.isEmail(email) && validator.isAlphanumeric(password);

		if(validatePass)
		{
            console.log("user login input validation passed");
			next();
		}
		else
		{
            console.log("user login input validation failed");
			res.status(500).json({ message: "User login input validation failed for values of json keys provided."});
		}
	}

}

module.exports = validateMiddleware;