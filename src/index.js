// require(dotenv).config()  // for commonjs
import dotenv from 'dotenv' // for es6 module

import connectDB from "./db/index.js";
  
dotenv.config({
    path:'./env'
})
connectDB();



/*  ONE OF THE APPROACH TO CONNECT DATABASE WITH EXPRESS APP  
import express from "express";

// sometimes express app is used to define  error that the database is connected but cannot able to talk to the express app
const app = express(); 


 // use of iffe to use async await at the top level and use of ; to represent iffe in code
;(async()=>{
    try{
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)

    app.on("error",(error)=>{
        console.log('error is occured');
        throw error
    })
    
    app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
    })
    } catch(error){
        console.error("Error connecting to the database", error);
        throw error
    }
})()  
    */