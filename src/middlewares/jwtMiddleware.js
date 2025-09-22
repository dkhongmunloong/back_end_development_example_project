require("dotenv").config();
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;
const tokenAlgorithm = process.env.JWT_ALGORITHM;

var jwtMiddleware = {

    generateToken: (req, res, next) => 
    {
        const payload = {
            userid: res.locals.userid,
            role: res.locals.role,
            timestamp: new Date()
        };

        const options = {
            algorithm: tokenAlgorithm,
            expiresIn: tokenDuration,
        };

        const callback = (err, token) => {
            if (err) {
                console.error("Error generating jwt:", err);
                res.status(500).json(err);
            } else {
                res.locals.token = token;
                res.locals.message = 'User authenticated, json web token successfully generated and sent back';
                next();
            }
        };

        //console.log('generateToken, checking payload:');
        //console.log(payload);
        //console.log(res.locals.role);
        // Generate a JWT token with the provided payload and duration
        const token = jwt.sign(payload, secretKey, options, callback);
    },

    sendToken: (req, res, next) => 
    {
        res.status(200).json({
            message: res.locals.message,
            token: res.locals.token,
        });
    }, 

    verifyToken: (req, res, next) => 
    {
        // Get the token from the request headers
        const authHeader = req.headers.authorization;

        // Check if the Authorization header exists
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Check if the token exists
        if (!token) {
            return res.status(401).json({ error: "No token provided, json web token is required for accessing this web service" });
        }

        const callback = (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid token" });
            }

            // Token is valid, store the decoded information for later use
            res.locals.userid = decoded.userid;
            res.locals.role = decoded.role;
            res.locals.tokenTimestamp = decoded.timestamp;
            
            // console.log('verifyToken, checking decoded payload:');
            // console.log(res.locals.userid);
            // console.log(res.locals.role);
            // console.log(res.locals.tokenTimestamp);
            // Move to the next middleware or route handler
            next();
        };
        // Verify the token
        jwt.verify(token, secretKey, callback);
    },

    verifyAdmin: (req, res, next) => {
        // console.log('verifyAdmin, checking role:');
        // console.log(res.locals.role);

        if (res.locals.role == "Admin")
        {
            next();
        }
        else
        {
            return res.status(401).json({ error: "Invalid Access Role for accessing this web service" });
        }
    }
}

module.exports=jwtMiddleware;