const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required: true,
    },
    password : {
        type : String,
        required: true,
    },
    profile_pic : {
        type : String,
        default : 'empty-avatar.jpg'
    },
    createdAt : {
        type : Date,
        default : moment().format("DD/MM/YYYY")+";"+moment().format("hh:mm:ss")
    },
    updatedAt :{
        type:Date,
        default : moment().format("DD/MM/YYYY")+";"+moment().format("hh:mm:ss")
    }
})

const User = mongoose.model("users",userSchema);
module.exports = User;
