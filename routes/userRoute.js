//Include Libraries

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const {check,validationResult, body} = require('express-validator');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const User = require('./../models/User');
const token_key = process.env.TOKEN_KEY;


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));

//Routes
//api/users
router.get('/',(req,res) => {
    res.status(200).json({
        status: 'success',
        message : 'user default route'
    })
})

router.post('/register',
    [
        //check empty fields
        check('username').not().isEmpty().trim().escape(),
        check('password').not().isEmpty().trim().escape(),
        //check email
        check('email').isEmail().normalizeEmail()
    ],
    (req,res)=>{
        const errors = validationResult(req);
        //check error is not empty
        if(!errors.isEmpty()){
            return res.status(404).json({
                status: 'validate error',
                errors: errors.array()
            })
        }

        return res.status(200).json({
            status : 'success',
            data : req.body
        })
    }
)

module.exports = router;