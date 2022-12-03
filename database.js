//INCLUDE LIBRARY
const mongoose = require('mongoose');
const assert = require('assert');
const db_url = process.env.DB_URL;
//ESTABLISE DB CONNECTION
mongoose.connect(db_url,{
    useNewUrlParser : true,
},(err,link)=>{
    assert.strictEqual(err,null,'DB connect fail');
    console.log('connected to db sucessfully');
});

