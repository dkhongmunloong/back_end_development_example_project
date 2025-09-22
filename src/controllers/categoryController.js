const model = require('../models/categoryModel');

// add on advanced feature system logging to log file
const winston = require('winston');
const startlog = require('../utils/syslogger');
const syslogger = winston.loggers.get('category_controller');

var categoryController = 
{
    readAllCategory: (req, res, next) =>
    {
        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error readAllCategory:", error);
                res.status(500).json(error);
            }  
            else 
            {
                res.status(200).json(results);
                syslogger.info("readAllCategory: query attempt");
            }
        }

        model.selectAllCategory(callback);
    },

    addNewCategory: (req, res, next) =>
    {
        // add on advanced feature to check if name and description is valid before querying
        const name_exist = (typeof req.body.name !== "undefined");
        const description_exist = (typeof req.body.description !== "undefined");
        const all_info_exist = name_exist && description_exist;

        if(all_info_exist)
        {
            const data = {
                name: req.body.name,
                description: req.body.description
            }

            const callback = (error, results, fields) => {
                if (error) {
                    console.error("Error addNewCategory:", error);
                    res.status(500).json(error);
                } else {
                    const return_msg = {message: "New fashion category created successfully." };
                    res.status(201).json(return_msg);

                    const info_msg = `addNewCategory: new category with name: ${data.name} created successfully`;
                    syslogger.info(info_msg);
                }
            }

            model.insertNewCategory(data, callback);
        }
        else
        {
            res.status(500).json({ message: "Name or description is not provided as required by this web service."});	
        }
    },

    // advanced feature additional web service 
    getCategorybySearchKey: (req, res, next) =>
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
                console.error("Error getCategorybySearchKey:", error);
                res.status(500).json(error);
            } else {
                if(results.length == 0) 
                {
                    res.status(404).json({
                        message: "Category not found based on search key"
                    });
                }
                else res.status(200).json(results);
            }
        }        

        if(isNaN(data.searchkey))
        {
            model.getCategoryByName(data, callback);
        }
        else
        {
            model.getCategoryById(data, callback);
        }
    },

    updateCategoryById: (req, res, next) =>
    {
        let inputCatID = parseInt(req.params.catid);
        
        if(isNaN(inputCatID))
        {
            res.status(500).json({ message: "Category ID provided for update is not an integer"});
        }
        else
        {
            const catname_exist = (typeof req.body.name !== "undefined");
            const catdescription_exist = (typeof req.body.description !== "undefined");
            const all_info_exist = catname_exist && catdescription_exist;
            
            if(all_info_exist)
            {
                const data = {
                    catname: req.body.name,
                    catdescription: req.body.description,
                    catid: req.params.catid
                }			

                let error_msg = `updateCategoryById: category with id: ${data.catid} failed to update`;
                let info_msg = `updateCategoryById: category with id: ${data.catid} updated successfully`;
                
                const callback = (error, results, fields) => 
                {
                    if (error)
                    {
                        console.error("Error updateCategoryById:", error);
                        res.status(500).json(error);
                        error_msg = error_msg + ", sql query error.";
                        syslogger.error(error_msg);
                    } 
                    else 
                    {
                        if(results.affectedRows == 0)
                        {
                            res.status(404).json({
                                message: "Category not found for update based on catid provided"
                            });
                            error_msg = error_msg + ", catid not found.";
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
                
                model.updateCategoryById(data, callback);	
            }
            else
            {
                res.status(500).json({ message: "Json keys, name or description is not provided as required by this web service."});	
            }
            
        }
    }    

}

module.exports = categoryController;