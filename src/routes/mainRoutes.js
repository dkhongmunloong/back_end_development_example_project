const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');

router.use("/user", userRoutes);
router.use("/category", categoryRoutes);
router.use("/product", productRoutes);

module.exports = router;