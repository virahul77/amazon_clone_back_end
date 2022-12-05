//Include Libraries

const router = require("express").Router();
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { check, validationResult, body } = require("express-validator");
const jwt = require("jsonwebtoken");
const moment = require("moment");

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
    check("username").not().isEmpty().trim().escape(),
    check("password").not().isEmpty().trim().escape(),
    //check email
    check("email").isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //check error is not empty
    if (!errors.isEmpty()) {
      return res.status(404).json({
        status: "validate error",
        errors: errors.array(),
        message : "form validation error"
      });
    }

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (user) {
          return res.status(409).json({
            status: "fail",
            message: "user email already exist",
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
                status: "failed",
                error,
              });
            });
        }
      })
      .catch((error) => {
        return res.status(502).json({
          status: "failed",
          error,
        });
      });
  }
);

//POST /api/user/uploadProfilePic
router.post("/uploadProfilePic", (req, res) => {
  let upload = storage.getProfilePicUpload();
  upload(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        status: "failed upload",
        error,
      });
    }
    return res.status(200).json({
      status: "success",
      message: "File upload success",
      file: req.file,
    });
  });
});

// POST user login route
router.post(
  "/login",
  [
    //check empty fields
    check("email").not().isEmpty().trim().escape(),
    check("password").not().isEmpty().trim().escape(),
    //check email
    check("email").isEmail().normalizeEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "failed",
        errors: errors.array(),
        message : "form validation error"
      });
    }

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            status: "failed",
            message: "User Don,t exist",
          });
        } else {
          let isPasswordMatch = bcrypt.compareSync(req.body.password,user.password);
          if(!isPasswordMatch){
            return res.status(401).json({
              status : 'failed',
              message : 'password dont match'
            })
          }
          let token = jwt.sign({id:user._id,email:user.email},token_key,{
            expiresIn : 3600
          })

          return res.status(200).json({
            status: "success",
            message: "user login success",
            token,
            user
          });
        }
      })
      .catch((error) => {
        return res.status(502).json({
          status: "failed",
          message: "datatbase error",
          error,
        });
      });
  }
);

const verifyToken = require('./../middleware/verify_token')

//GET /api/user/testJWT
router.get('/testJWT',verifyToken,(req,res)=>{
  console.log(req.user);
  return res.status(200).json({
    status : true,
    message : 'JWT Verified'
  })
})
module.exports = router;
