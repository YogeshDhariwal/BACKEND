//console.log('backend with yogesh');
require('dotenv').config();
const express=require("express");
const app=express()
const port =process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send("hello world")
})

app.get('/twitter',(req,res)=>{
    res.send("yogidhariwalcom")
})
app.get('/login',(req,res)=>{
    res.send('<h1>welcome to the login page </h1>')
})
app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`);
})