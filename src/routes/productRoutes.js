const express = require('express');
const router = express.Router();

const controller = require("../controllers/productController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// public web API
router.get('/', controller.readAllProducts);
router.get('/:searchkey', controller.getProductsBySearchKey);
// advanced feature additional web service
router.get('/find/column', controller.getProductBySearchColumn);

// Admin web API, these services require bearer token to authenticate before response
router.post('/', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, controller.addNewProduct);
router.delete('/', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, controller.deleteProductByNameOrBrand);
router.delete('/:productid', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, controller.deleteProductById);
router.put('/:productid', jwtMiddleware.verifyToken, jwtMiddleware.verifyAdmin, controller.updateProductById);

module.exports = router;