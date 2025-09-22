const pool = require('../services/db');

var productModel = {

    // CA 1 requirement
    selectAllProducts: (callback) => {
        const SQLSTATEMENT = `SELECT * FROM fashion_product;`;
        pool.query(SQLSTATEMENT, callback);
    },

    // CA 1 requirement
    getProductByIdYearSort: (data, callback) => {
        const SQLSTATEMENT = `SELECT * from fashion_product WHERE catid = ? and YEAR(date) >= YEAR(CURDATE()) ORDER BY YEAR(date) ASC, date ASC;`;
        const VALUES = [data.searchkey];
        pool.query(SQLSTATEMENT, VALUES, callback);
    },

    // CA 1 requirement
    getProductBySsYearSort: (data, callback) => {
        const SQLSTATEMENT = `SELECT * from fashion_product WHERE name like ? and YEAR(date) >= YEAR(CURDATE()) ORDER BY YEAR(date) ASC, date ASC;`;
        const VALUES = [data.searchkey];
        pool.query(SQLSTATEMENT, VALUES, callback);
    },

    // CA 1 requirement
    insertNewProduct: (data, callback) => 
    {
        const SQLSTATMENT = `
            INSERT INTO fashion_product(name, description, brand, imageurl, catid)
            VALUES (?,?,?,?,?);
            `;
        const VALUES = [data.name, data.description, data.brand, data.imageurl, data.catid];
    
        pool.query(SQLSTATMENT, VALUES, callback);
    },

    // CA 1: advanced feature additional web service
    getProductBySearchColumn: (data, callback) => {
        const SQLSTATEMENT = `SELECT * FROM fashion_product WHERE \`${data.searchCol}\` = ?;`;
        const VALUES = [data.searchVal];
        pool.query(SQLSTATEMENT, VALUES, callback);
    },

    // CA 2 requirement
    deleteProductByName : (data, callback) => {
        const SQLSTATMENT = `
            DELETE FROM fashion_product
            WHERE name = ?
            `;
        const VALUES = [data.name];

        pool.query(SQLSTATMENT, VALUES, callback);        
    },

    // CA 2 requirement
    deleteProductByBrand : (data, callback) => {
        const SQLSTATMENT = `
            DELETE FROM fashion_product
            WHERE brand = ?
            `;
        const VALUES = [data.brand];

        pool.query(SQLSTATMENT, VALUES, callback);        
    },

    // CA 2 requirement
    deleteProductById : (data, callback) => {
        const SQLSTATMENT = `
            DELETE FROM fashion_product
            WHERE productid = ?
            `;
        const VALUES = [data.productid];

        pool.query(SQLSTATMENT, VALUES, callback);        
    },

    // CA 2 requirement
    updateProductById : (data, callback) => {
        const SQLSTATMENT = `
            UPDATE fashion_product 
            SET name=?, description=?, 
            brand=?, imageurl=?, catid=? 
            WHERE productid=?;
            `;
        const VALUES = [data.name, data.description, data.brand, data.imageurl, data.catid, data.productid];

        pool.query(SQLSTATMENT, VALUES, callback);
    }
}

module.exports = productModel;