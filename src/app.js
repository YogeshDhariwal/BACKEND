import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
// middlewares cors package is used to handle cross origin resource sharing issues ,we also set origin here from where we want to allow the requests
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}));

app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true,limit: '10kb' })) // for parsing application/x-www-form-urlencoded

app.use(express.static("public")) // for public assets like images ,css files ,js files etc

// cookies parser middleware is used to parse cookies from the request headers
app.use(cookieParser());

export {app};