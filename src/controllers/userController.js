const model = require("../models/userModel");

// add on advanced feature system logging to log file
const winston = require('winston');
const startlog = require('../utils/syslogger');
const syslogger = winston.loggers.get('user_controller');

var userController = {

    loginUserOld: (req, res, next) => 
    {
        const email_exist = (typeof req.body.email !== "undefined");
        const pw_exist = (typeof req.body.password !== "undefined");
        const all_info_exist = email_exist && pw_exist;

        if(all_info_exist)
        {
            const data = {
                email: req.body.email,
                password: req.body.password
            };

            const callback = (error, results, fields) => {
                if (error) 
                {
                    console.error("Error Login:", error);
                    res.status(500).json(error);
                    const error_msg = "Error in loginUser: " + error;
                    syslogger.error(error_msg);
                }
                else 
                {
                    //no match   
                    if (results.length == 0) 
                    {
                        res.status(404).json({
                            message: "email or password provided is wrong",
                        });
                        syslogger.warn('Wrong email or password attempt');
                    }
                    else 
                    {  
                        //match email and password
                        res.locals.userid = results[0].userid; //saves userid from database in res.locals for use in jwt payload
                        res.locals.role = results[0].role;     //saves role from database in res.locals for use in jwt payload
                        //res.locals.message = 'User authenticated, json web token successfully generated and sent back';
                        next(); //call next middleware to issue token
                    }
                }


            };

            model.loginUser(data, callback);
        }
        else
        {
            res.status(500).json({ message: "Email or password is not provided as required by this web service."});
        }
    },

    loginUser: (req, res, next) => 
    {
        const email_exist = (typeof req.body.email !== "undefined");
        const pw_exist = (typeof req.body.password !== "undefined");
        const all_info_exist = email_exist && pw_exist;

        if(all_info_exist)
        {
            const data = {
                email: req.body.email
            };

            const callback = (error, results, fields) => {
                if (error) 
                {
                    console.error("Error Login:", error);
                    res.status(500).json(error);
                    const error_msg = "Error in loginUser: " + error;
                    syslogger.error(error_msg);
                }
                else 
                {
                    //no match   
                    if (results.length == 0) 
                    {
                        res.status(404).json({
                            message: "email provided is wrong",
                        });
                        syslogger.warn('Wrong email attempt for loginUser');
                    }
                    else 
                    {  
                        //match email
                        res.locals.userid = results[0].userid; // saves userid from database in res.locals for use in jwt payload
                        res.locals.email = results[0].email;
                        res.locals.name = results[0].name;
                        res.locals.role = results[0].role;     // saves role from database in res.locals for use in jwt payload
                        res.locals.hash = results[0].password; // saves hash password from database for comparison in Bcrypt middleware
                        
                        const info_msg = `loginUser: user id ${res.locals.userid} with email ${res.locals.email} logged in successfully`;
                        syslogger.info(info_msg);
                        //call next middleware to issue token
                        next(); 
                    }
                }


            };

            model.checkEmailExist(data, callback);
        }
        else
        {
            res.status(500).json({ message: "Email or password is not provided as required by this web service."});
        }
    },

    checkEmailExist: (req, res, next) => 
    {
        const data = {
            email: req.body.email
        };

        const callback = (error, results, fields) => {
            if (error) 
            {
                console.error("Error Login:", error);
                res.status(500).json(error);
            }
            else 
            {
                if (results.length == 0) 
                {
                    // Does not exist in database, email is unique
                    next(); 		
                }
                else 
                {  
                    // match existing email, it is not unique
                    res.status(404).json( {message: "email already exist in database. Retry using another email to register."} );
                }
            }
        };

        model.checkEmailExist(data, callback);
    },

    // advanced feature additional web service
    registerOld : (req, res, next) =>
    {
        // check if request body contains necessary fields
        const name_exist = (typeof req.body.name !== "undefined");
        const email_exist = (typeof req.body.email !== "undefined");
        const pw_exist = (typeof req.body.password !== "undefined");
        const body_info_exist = name_exist && email_exist && pw_exist;
        
        if(body_info_exist)
        {
            const default_user_role = "Member";
            const data = {
                name: req.body.name,
                email: req.body.email,
                role: default_user_role,
                password: req.body.password
            };
            
            res.locals.role = default_user_role;
            res.locals.message = 'User ' + data.name;

            const callback = (error, results, fields) => {
                if (error) 
                {
                    console.error("Error register for new user:", error);
                    res.status(500).json(error);
                    res.locals.role = '';
                    res.locals.message = '';
                } 
                else 
                {
                    console.log('Inserted row ID:', results.insertId);
                    res.locals.userid = results.insertId;
                    res.locals.message = res.locals.message + ' created successfully';
                    next(); //call next middleware to issue token

                    const info_msg = `register: user id ${results.insertId} created successfully`;
                    syslogger.info(info_msg);
                }
            }

            model.insertNewUser(data, callback);
        }
        else
        {
            res.status(500).json({ message: "Name or email or password are not provided."});	
        }
    },

    // advanced feature additional web service
    register : (req, res, next) =>
    {
        // check if request body contains necessary fields
        const name_exist = (typeof req.body.name !== "undefined");
        const email_exist = (typeof req.body.email !== "undefined");
        const pw_exist = (typeof req.body.password !== "undefined");
        const body_info_exist = name_exist && email_exist && pw_exist;
        
        if(body_info_exist)
        {
            const default_user_role = "Member";
            const data = {
                name: req.body.name,
                email: req.body.email,
                role: default_user_role,
                password: res.locals.hash
            };
            
            res.locals.role = default_user_role;
            res.locals.message = 'User ' + data.name;

            const callback = (error, results, fields) => {
                if (error) 
                {
                    console.error("Error register for new user:", error);
                    res.status(500).json(error);
                    res.locals.role = '';
                    res.locals.message = '';
                } 
                else 
                {
                    console.log('Inserted row ID:', results.insertId);
                    res.locals.userid = results.insertId;
                    res.locals.message = res.locals.message + ' created successfully';
                    next(); //call next middleware to issue token

                    const info_msg = `register: user id ${results.insertId} created successfully`;
                    syslogger.info(info_msg);
                }
            }

            model.insertNewUser(data, callback);
        }
        else
        {
            res.status(500).json({ message: "Name or email or password are not provided."});	
        }
    },    

    // advanced feature additional web service 
    getUserById: (req, res, next) =>
    {
        const data = {
            userid: req.params.userid
        }

        const testUserId = req.params.userid;
        const userid_exist = (typeof testUserId !== "undefined");
        const userid_isNaN = isNaN(testUserId);
        const userid_ok = userid_exist && !userid_isNaN;

        if (userid_ok)
        {
            const callback = (error, results, fields) => {
                if (error) {
                    console.error("Error getUserById:", error);
                    res.status(500).json(error);
                } else {
                    if(results.length == 0) 
                    {
                        res.status(404).json({
                            message: "User not found for specified userid"
                        });
                    }
                    else 
                    {
                        res.status(200).json(results[0]);

                        const info_msg = `getUserById: user id ${data.userid} information was requested`;
                        syslogger.info(info_msg);
                    }
                }
            }
            model.getUserById(data, callback);
        }
        else
        {
            res.status(500).json({ message: "User id is not provided or not a number"});
        }
    },

    // advanced feature additional web service 
    getUserByEmail: (req, res, next) =>
    {
        const data = {
            email: req.body.email
        };

        const testEmail = req.body.email;
        const email_exist = (typeof testEmail !== "undefined");

        if (email_exist)
        {
            const callback = (error, results, fields) => {
                if (error) {
                    console.error("Error getUserByEmail:", error);
                    res.status(500).json(error);
                } else {
                    if(results.length == 0) 
                    {
                        res.status(404).json({
                            message: "User not found for specified email"
                        });
                    }
                    else 
                    { 
                        res.status(200).json(results[0]);

                        const info_msg = `getUserByEmail: user email ${data.email} information was requested`;
                        syslogger.info(info_msg);
                    }
                }
            }
            model.getUserByEmail(data, callback);
        }
        else
        {
            res.status(500).json({ message: "Email is not provided. Please provide email key and value in body."});
        }
    }    

}

module.exports = userController;