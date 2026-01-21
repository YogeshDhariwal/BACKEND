// require(dotenv).config()  // for commonjs
import dotenv from 'dotenv' // for es6 module
import { app } from './app.js';
import connectDB from "./db/index.js";
  
dotenv.config({
    path:'./env'
})
connectDB()
// connectDB contain async await function so it returns promise
// so we can use then catch also
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`App is listening on port ${process.env.PORT} `);
    }
)})
.catch((error)=>{
   console.log('MONGODB CONNECTION FAILED !!! ',error);
})



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