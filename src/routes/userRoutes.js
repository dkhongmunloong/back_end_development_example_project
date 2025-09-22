const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");
const bcryptMiddleware = require("../middlewares/bcryptMiddleware");

// advanced feature additional web service
// admin web service to get user by email require jwt, get all fields except password
router.get('/', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, userController.getUserByEmail);

// advanced feature additional web service
// admin web service to get user by id require jwt, get all fields except password
router.get('/:userid', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, userController.getUserById);

// public web service to login, submit credentials to get return json web token
router.post("/login", validateMiddleware.validateUserLogin, userController.loginUser, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken);
// router.post("/login", validateMiddleware.validateUserLogin, userController.loginUserOld, jwtMiddleware.generateToken, jwtMiddleware.sendToken);

// advanced feature additional web service
// public web service to register new default role user and get return json web token 
router.post("/register", validateMiddleware.validateUserRegister, userController.checkEmailExist, bcryptMiddleware.hashPassword, userController.register, jwtMiddleware.generateToken, jwtMiddleware.sendToken);
// router.post("/register", validateMiddleware.validateUserRegister, userController.checkEmailExist, userController.registerOld, jwtMiddleware.generateToken, jwtMiddleware.sendToken);

module.exports = router;