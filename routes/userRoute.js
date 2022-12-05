//Include Libraries

const router = require("express").Router();
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { check, validationResult, body } = require("express-validator");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const verifyToken = require('./../middleware/verify_token')
const User = require("./../models/User");
const token_key = process.env.TOKEN_KEY;
const storage = require("./storage");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//Routes
//GET api/users
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "user default route",
  });
});

//POST /api/user/register
router.post(
  "/register",
  [
    //check empty fields
    check("username").not().isEmpty().withMessage("validation.username_empty").trim().escape(),
    check("password").not().isEmpty().withMessage('validation.password_empty').trim().escape(),
    //check email
    check("password2").not().isEmpty().withMessage('validation.password2_empty').trim().escape(),
    //check email
    check("email").isEmail().normalizeEmail().withMessage('validation.invalid_email'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //check error is not empty
    let error = {};
    errors.array().forEach(err=> error[err.param]=err.msg)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        error,
        message : "form validation error"
      });
    }

    if(req.body.password !== req.body.password2){
      return res.status(400).json({
        status : false,
        error : {
          password2 : 'validation.password2_not_same'
        },
        message : 'form validation error'
      })
    }

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (user) {
          return res.status(409).json({
            status: false,
            error : {
              email : 'validation.email_exists'
            },
            message : 'user email already exist'
          });
        } else {
          const { email, username, password } = req.body;
          const salt = bcrypt.genSaltSync(10);
          const hashedPassword = bcrypt.hashSync(password, salt);
          const newUser = new User({
            email,
            username,
            password: hashedPassword,
          });
          newUser
            .save()
            .then((result) => {
              return res.status(201).json({
                status: "success",
                user: result,
              });
            })
            .catch((error) => {
              return res.status(502).json({
                status: false,
                error : {
                  db_error : 'validation.db_error'
                }
              });
            });
        }
      })
      .catch((error) => {
        return res.status(502).json({
          status: "failed",
          error : {
            db_error : 'validation.db_error'
          }
        });
      });
  }
);

//POST /api/user/uploadProfilePic
//access private
router.post("/uploadProfilePic",verifyToken, (req, res) => {
  let upload = storage.getProfilePicUpload();
  upload(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        status: false,
        error,
        message : 'File upload fail..'
      });
    }
    if(!req.file){
      return res.status(400).json({
        status : false,
        error : {
          profile_pic : 'validation.profile_pic_empty'
        },
        message : 'Please upload profic pic'
      })
    }
    //if profile pic upload error
    
    //store new profile pic name
    User.findByIdAndUpdate(req.user.id,{
      $set : {
        profile_pic : req.file.filename,
        updatedAt : moment().format("DD/MM/YYYY")+";"+moment().format("hh:mm:ss")
      }
    }).then(user => {
      return res.status(200).json({
        status: "success",
        message: "File upload success",
        profile_pic : "http://localhost:5000/public_pic/"+req.file.filename
      });
    }).catch(error => {
      return res.status(502).json({
        status : false,
        message : 'Database Error'
      })
    })
  });
});

// POST user login route
router.post(
  "/login",
  [
    //check empty fields
    check("password").not().isEmpty().withMessage('validation.password_empty').trim().escape(),
    //check email
    check("email").isEmail().normalizeEmail().withMessage('validation.invalid_email'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    let error = {}
    errors.array().forEach(err=> error[err.param]=err.msg)
    if (!errors.isEmpty()) {
      return res.status(404).json({
        status: false,
        error, 
        message : "form validation error"
      });
    }

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            status: false,
            error : {
              email : 'validation.email_not_exists'
            },
            message : 'User do,nt exist'
          });
        } else {
          let isPasswordMatch = bcrypt.compareSync(req.body.password,user.password);
          if(!isPasswordMatch){
            return res.status(401).json({
              status : false,
              eror : {
                password : 'validation.password_not_match'
              }
            })
          }
          let token = jwt.sign({id:user._id,email:user.email},token_key,{
            expiresIn : 3600
          })

          return res.status(200).json({
            status: true,
            message: "user login success",
            token,
            user
          });
        }
      })
      .catch((error) => {
        return res.status(502).json({
          status: false,
          message: "Database error",
          error : {
            db_error : 'validation.db_error'
          }
        });
      });
  }
);

//GET /api/user/testJWT
router.get('/testJWT',verifyToken,(req,res)=>{
  console.log(req.user);
  return res.status(200).json({
    status : true,
    message : 'JWT Verified'
  })
})
//access private POST /api/user/change_password
router.put(
  "/change_password",verifyToken,
  [
    //check empty fields
    check("username").not().isEmpty().withMessage("validation.username_empty").trim().escape(),
    check("newPassword").not().isEmpty().withMessage('validation.password_empty').trim().escape(),
    check("newPassword2").not().isEmpty().withMessage('validation.password2_empty').trim().escape(),
    check("oldPassword").not().isEmpty().withMessage('validation.password_empty').trim().escape()
  ],
  (req, res) => {
    const errors = validationResult(req);
    //check error is not empty
    let error = {};
    errors.array().forEach(err=> error[err.param]=err.msg)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        error,
        message : "form validation error"
      });
    }

    if(req.body.newPassword !== req.body.newPassword2){
      return res.status(400).json({
        status : false,
        error : {
          password2 : 'validation.password2_not_same'
        },
        message : 'form validation error'
      })
    }
    // console.log(req.user.id);
    User.findOne({ _id: req.user.id })
      .then((user) => {
        //check oldpassword match with password
        // console.log('yy');
        const isMatch = bcrypt.compareSync(req.body.oldPassword,user.password)
        console.log(isMatch);
        if(!isMatch){
          return res.status(400).json({
            status : false,
            error : {
              oldPassword : 'validation.oldPassword_not_match'
            },
            message : 'old password does not match'
          })
        }

        //update new password
        const newData = {
          username : req.body.username,
          password : bcrypt.hashSync(req.body.newPassword,bcrypt.genSaltSync(10)),
          updatedAt : moment().format("DD/MM/YYYY")+";"+moment().format("hh:mm:ss")
        }

        User.findOneAndUpdate({_id:req.user.id},{$set:newData},{new:true}).then((user)=>{
          return res.status(200).json({
            status : true,
            user : {
              username : user.username
            },
            message : "password change successfully"
          })
        }).catch((err)=>{
          return res.status(502).json({
            status : false,
            error : {
              db_error : 'validation.db_error'
            },
          })
        })
      })
      .catch(err => {
        return res.status(502).json({
          status: "failed",
          error : {
            db_error : 'validation.db_error'
          },
          msg:err
        });
      });
  }
);

module.exports = router;
