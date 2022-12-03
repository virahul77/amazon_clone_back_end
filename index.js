//Libraray include
require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
const morgan = require('morgan');
const port = process.env.PORT;
const database = require('./database');

const userRoutes = require('./routes/userRoute');
app.use(cors());
app.use(morgan('dev'));

app.use('/api/users',userRoutes);
//Route 
app.get('/',(req,res)=>{
    return res.status(200).json({
        status: true,
        message : "Amazon clone rest api home clone"
    })
})

app.listen(port,()=>{
    console.log("server running at port "+port+" successfully");
})