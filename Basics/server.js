import express from 'express'
const app=express();
// ****  
//cors  is cross origin resource security  is a web browser security feature that allows web pages from same origin means same port,same domain,same localhost if not then it shows an error to solve this we use to import cors package in backend  
const port=process.env.PORT || 3000

app.get('/',(req,res)=>{
    res.send("server is ready")
})

// get a list of 5 jokes
app.get('/api/jokes',(req,res)=>{
    const jokes=[
        {
            id:1,
            title:' 1 A joke',
            content:'This is a 1 joke'
        },
         {
            id:2,
            title:' 2 A joke',
            content:'This is a 2 joke'
        },
         {
            id:3,
            title:'3 A joke',
            content:'This is a 3 joke'
        },
         {
            id:4,
            title:'4 A joke',
            content:'This is a 4 joke'
        },
         {
            id:5,
            title:' 5 A joke',
            content:'This is a 5 joke'
        },
    ]
    res.send(jokes);
})

app.listen(port,()=>{
    console.log(`server is at http://localhost:${port}`);
})

