const multer = require('multer');
const randomstring = require('randomstring');
const path = require('path');
//validate image type

function checkFileType(file,cb){
    const allowedTypes = /jpeg|png|jpg|gif/;
    //check match file extention
    const isMathExt = allowedTypes.test(path.extname(file.originalname).toLowerCase())

    const isMIMEMatch = allowedTypes.test(file.mimetype);
    //match mime type
    if(isMathExt && isMIMEMatch){
        cb(null,true);
    } else {
        cb("Error file type not supported")
    }
}

function getProfilePicUpload(){
    let storage = multer.diskStorage({
        destination : function(req,file,cb){
            cb(null,`./public/public_pic`);
        },
        filename : function(req,file,cb){
            let p1 = randomstring.generate(5);
            let p2 = randomstring.generate(5);
            let ext = path.extname(file.originalname).toLowerCase();
            cb(null,p1+'_'+p2+ext);

        }
    })

    return multer({
        storage:storage,
        limits : {
            fileSize : 1000000
        },fileFilter : function(req,file,cb){
            checkFileType(file,cb)
        }
    }).single('p-pic');
}


module.exports = {
    getProfilePicUpload
}