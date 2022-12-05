
const jwt = require('jsonwebtoken');

const token_key = process.env.TOKEN_KEY;
const User = require('./../models/User');

function verifyToken(req,res,next){
    //read jwt token from http header
    const token = req.headers['x-access-token'];

    //check token empty
    if(!token) {
        return res.status(404).json({
            status : false,
            message : 'JWT Token not found'
        })
    }

    jwt.verify(token,token_key,function(error,decoded){
        if(error){
            return res.status(401).json({
                status : false,
                message : 'JSON Token not decoded...',
                error
            })
        }

        User.findById(decoded.id,{password:0,createdAt:0,updatedAt:0,profile_pic:0}).then(user => {
            if(!user){
                return res.status(404).json({
                    status : false,
                    message : 'Uer dont exist'
                })
            }
            //set user object in req object
            req.user = {
                id : user._id,
                email : user.email,
                username: user.username
            }
            return next();
        }).catch(error => {
            return res.status(502).json({
                status : false,
                message : 'Database Error'
            })
        })
    })
}

module.exports = verifyToken;