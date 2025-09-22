const express = require('express');
const router = express.Router();

const controller = require('../controllers/categoryController');
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// these services require bearer token to authenticate before response
router.get('/', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, controller.readAllCategory);
// advanced feature additional web service
router.get('/:searchkey', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, controller.getCategorybySearchKey);

router.post('/', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, controller.addNewCategory);

// CA 2 add on feature
router.put('/:catid', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, controller.updateCategoryById);

module.exports = router;