const model = require('../models/productModel');

// add on advanced feature system logging to log file
const winston = require('winston');
const startlog = require('../utils/syslogger');
const syslogger = winston.loggers.get('product_controller');

var productController = 
{
    readAllProducts: (req, res, next) => 
    {
        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error readAllProducts:", error);
                res.status(500).json(error);
            }  
            else res.status(200).json(results);
        }

        model.selectAllProducts(callback);
    },

    getProductsBySearchKey: (req, res, next) =>
    {

        let inputSearchKey = req.params.searchkey;

        if(isNaN(inputSearchKey))
        {
            // substring case
            inputSearchKey = '%' + inputSearchKey + '%';
        }

        const data = {
            searchkey: inputSearchKey
        }

        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error getProductsBySearchKey:", error);
                res.status(500).json(error);
            } else {
                if(results.length == 0) 
                {
                    res.status(404).json({
                        message: "Product not found"
                    });
                }
                else res.status(200).json(results);
            }
        }

        if(isNaN(data.searchkey))
        {
            model.getProductBySsYearSort(data, callback);
        }
        else
        {
            model.getProductByIdYearSort(data, callback);
        }
    },

    addNewProduct: (req, res, next) =>
    {
        // add on advanced feature to check if all fields are provided before querying
        // catid should be a number
        const name_exist = (typeof req.body.name !== "undefined");
        const description_exist = (typeof req.body.description !== "undefined");
        const brand_exist = (typeof req.body.brand !== "undefined");
        const imageurl_exist = (typeof req.body.imageurl !== "undefined");
        const catid_exist = (typeof req.body.catid !== "undefined") && !(isNaN(req.body.catid));
        const all_info_exist = name_exist && description_exist && brand_exist && imageurl_exist && catid_exist;

        if (all_info_exist)
        {
            const data = {
                name: req.body.name,
                description: req.body.description,
                brand: req.body.brand,
                imageurl: req.body.imageurl,
                catid: req.body.catid
            }

            const callback = (error, results, fields) => {
                if (error) {
                    console.error("Error addNewProduct:", error);
                    res.status(500).json(error);

                    const error_msg = `addNewProduct: product with name: ${data.name} failed to be added`;
                    syslogger.error(error_msg);
                } else {
                    const return_msg = {message: "New fashion product created successfully." };
                    res.status(201).json(return_msg);

                    const info_msg = `addNewProduct: new product with name: ${data.name} created successfully`;
                    syslogger.info(info_msg);
                }
            }

            model.insertNewProduct(data, callback);
        }
        else
        {
            res.status(500).json({ message: "Required http request body key and values are not provided as required by this web service."});
        }
    },

    // advanced feature additional web service 
    getProductBySearchColumn: (req, res, next) =>
    {
        const brand_exist = (typeof req.body.brand !== "undefined");
        const name_exist = (typeof req.body.name !== "undefined");
        const description_exist = (typeof req.body.description !== "undefined");

        const brand_exist_num = brand_exist ? 1 : 0;
        const name_exist_num = name_exist ? 1 : 0;
        const description_exist_num = description_exist ? 1 : 0;

        const exist_count = brand_exist_num + name_exist_num + description_exist_num; 

        if (exist_count > 1)
        {
            res.status(500).json({ message: "Too many search column provided, this web service requires only one search column"});
        }
        else if (exist_count === 1)
        {
            let searchCol = "";
            let searchVal = "";

            if(brand_exist)
            {
                searchCol = "brand";
                searchVal = req.body.brand;
            }
            else if (name_exist)
            {
                searchCol = "name";
                searchVal = req.body.name;
            }
            else
            {
                searchCol = "description";
                searchVal = req.body.description;
            }

            const data = {
                searchCol: searchCol,
                searchVal: searchVal,
            };

            const callback = (error, results, fields) => {
                if (error) {
                    console.error("Error getProductBySearchColumn:", error);
                    res.status(500).json(error);
                } else {

                    if(results.length == 0) 
                    {
                        res.status(404).json({
                            message: "Products not found based on search column and value provided"
                        });
                    }
                    else
                    {
                        res.status(200).json(results);
                    }
                }
            }

            console.log("getProductBySearchColumn:", data);
            model.getProductBySearchColumn(data, callback);
        }
        else
        {
            res.status(500).json({ message: "No search column was provided, this web service requires only one search column"});
        }     
    },

    deleteProductByNameOrBrand: (req, res, next) =>
    {
        const name_exist = (typeof req.body.name !== "undefined");
        const brand_exist = (typeof req.body.brand !== "undefined");

        const name_exist_num = name_exist ? 1 : 0;
        const brand_exist_num = brand_exist ? 1 : 0;

        const req_col_exist_count = name_exist_num + brand_exist_num;
        
        if (req_col_exist_count > 1)
        {
            res.status(500).json({ message: "Too many json keys provided, this web service requires only name or brand key."});
        }
        else if (req_col_exist_count === 1)
        {
            let data = {};
            let error_msg = "", info_msg = "";

            const callback = (error, results, fields) => 
            {
                if (error) 
                {
                    console.error("Error deleteProductByNameOrBrand:", error);
                    res.status(500).json(error);
                    error_msg = error_msg + ", sql query error.";
                    syslogger.error(error_msg);
                } 
                else 
                {
                    if(results.affectedRows == 0) 
                    {
                        res.status(404).json({
                            message: "Products not found for delete based on json key provided"
                        });
                        error_msg = error_msg + ", products not found.";
                        syslogger.error(error_msg);
                    }
                    else
                    {
                        // http status 204 for delete or put methods
                        res.status(204).send();
                        syslogger.info(info_msg);       
                    }
                }
            }

            if (name_exist)
            {
                data = {
                    name: req.body.name
                };
                error_msg = `deleteProductByNameOrBrand: products with name: ${data.name} failed to delete`;
                info_msg = `deleteProductByNameOrBrand: products with name: ${data.name} deleted successfully`;

                model.deleteProductByName(data, callback);
            }
            else if (brand_exist)
            {
                data = {
                    brand: req.body.brand
                };
                error_msg = `deleteProductByNameOrBrand: products with brand: ${data.brand} failed to delete`;
                info_msg = `deleteProductByNameOrBrand: products with brand: ${data.brand} deleted successfully`;

                model.deleteProductByBrand(data, callback);
            }
        }
        else
        {
            res.status(500).json({ message: "No json key was provided, this web service requires only name or brand key."});
        }

    },

    deleteProductById: (req, res, next) =>
    {
        let inputProductID = parseInt(req.params.productid);
        //console.log("deleteProductById, inputProductID:", inputProductID);

        if(isNaN(inputProductID))
        {
            // Provided params is non numerical format
            res.status(500).json({ message: "Product ID provided for deletion is not an integer"});
        }
        else
        {
            // Provided params is numerical format
            const data = {
                productid: req.params.productid
            }
            
            let error_msg = `deleteProductById: product with id: ${data.productid} failed to delete`;
            let info_msg = `deleteProductById: product with id: ${data.productid} deleted successfully`;
            
            const callback = (error, results, fields) => 
            {
                if (error) 
                {
                    console.error("Error deleteProductById:", error);
                    res.status(500).json(error);
                    error_msg = error_msg + ", sql query error.";
                    syslogger.error(error_msg);
                } 
                else 
                {
                    if(results.affectedRows == 0) 
                    {
                        res.status(404).json({
                            message: "Product not found for delete based on product id provided"
                        });
                        error_msg = error_msg + ", id not found.";
                        syslogger.error(error_msg);
                    }
                    else
                    {
                        // http status 204 for delete or put methods
                        res.status(204).send();
                        syslogger.info(info_msg);       
                    }
                }
            }
            
            model.deleteProductById(data, callback);
        }
    },

    updateProductById: (req, res, next) =>
    {
        let inputProductID = parseInt(req.params.productid);
        
        if(isNaN(inputProductID))
        {
            res.status(500).json({ message: "Product ID provided for update is not an integer"});
        }
        else
        {
            const name_exist = (typeof req.body.name !== "undefined");
            const description_exist = (typeof req.body.description !== "undefined");
            const brand_exist = (typeof req.body.brand !== "undefined");
            const imageurl_exist = (typeof req.body.imageurl !== "undefined");
            const catid_exist = (typeof req.body.catid !== "undefined");

            const name_exist_num = name_exist ? 1 : 0;
            const descript_exist_num = description_exist ? 1 : 0;
            const brand_exist_num = brand_exist ? 1 : 0;
            const imgurl_exist_num = imageurl_exist ? 1 : 0;
            const catid_exist_num = catid_exist ? 1 : 0;

            const req_col_exist_count = name_exist_num + descript_exist_num + brand_exist_num + imgurl_exist_num + catid_exist_num;
            
            if (req_col_exist_count === 5)
            {
                let data = {
                    name: req.body.name,
                    description: req.body.description,
                    brand: req.body.brand,
                    imageurl: req.body.imageurl,
                    catid: req.body.catid,
                    productid: req.params.productid
                };
                
                let error_msg = `updateProductById: product with id: ${data.productid} failed to update`;
                let info_msg = `updateProductById: product with id: ${data.productid} updated successfully`;
                
                const callback = (error, results, fields) => 
                {
                    if (error) 
                    {
                        console.error("Error updateProductById:", error);
                        res.status(500).json(error);
                        error_msg = error_msg + ", sql query error.";
                        syslogger.error(error_msg);
                    } 
                    else 
                    {
                        if(results.affectedRows == 0) 
                        {
                            res.status(404).json({
                                message: "Products not found for update based on product id provided"
                            });
                            error_msg = error_msg + ", product id not found.";
                            syslogger.error(error_msg);
                        }
                        else
                        {
                            // Success, send http status 204 for delete or put methods
                            res.status(204).send();
                            syslogger.info(info_msg);       
                        }
                    }
                }
                
                model.updateProductById(data, callback);
            }
            else
            {
                // less than required number of json keys
                res.status(500).json({ message: "Too few json keys provided, this web service requires keys of name, description, brand, imageurl, catid."});
            }
        }
    }    
}

module.exports = productController;