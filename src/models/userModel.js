const pool = require('../services/db');

var userModel = {

    loginUser: (data, callback) => {
        const SQLSTATMENT = `SELECT * from user where email=? and password=?`;
        const VALUES = [data.email, data.password];

        pool.query(SQLSTATMENT, VALUES, callback);
    },

    checkEmailExist: (data, callback) => {
        const SQLSTATMENT = `SELECT * FROM user where email=?`;
        const VALUES = [data.email];

	    pool.query(SQLSTATMENT, VALUES, callback);
    },

    insertNewUser: (data, callback) => {
        const SQLSTATMENT = `
            INSERT INTO user(name, email, role, password)
            VALUES (?,?,?,?);
            `;
        const VALUES = [data.name, data.email, data.role, data.password];
    
        pool.query(SQLSTATMENT, VALUES, callback);
    },    

    // advanced feature additional web service
    getUserById: (data, callback) => {
        const SQLSTATMENT = `SELECT email, name, role FROM user WHERE userid=?;`;
        const VALUES = [data.userid];

        pool.query(SQLSTATMENT, VALUES, callback);
    },

    // advanced feature additional web service
    getUserByEmail: (data, callback) => {
        const SQLSTATMENT = `SELECT userid, name, role FROM user WHERE email=?;`;
        const VALUES = [data.email];

        pool.query(SQLSTATMENT, VALUES, callback);
    }      

}

module.exports = userModel;