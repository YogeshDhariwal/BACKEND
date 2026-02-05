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
/**cookie-parser is an Express middleware used to parse cookies from incoming HTTP requests and make them accessible via req.cookies. It is commonly used for authentication, session handling, and reading JWT tokens stored in cookies.
 * 
 */

app.use(cookieParser());

// routes import 

import userRoutes from './routes/user.routes.js';
import videoRoutes from './routes/video.routes.js';
import commentRoutes from './routes/comment.routes.js'
import tweetRoutes from './routes/tweet.routes.js'
import likeRoutes from './routes/like.routes.js'
import playlistRoutes from './routes/playlist.routes.js'

//routes declaration
app.use('/api/v1/users',userRoutes)
app.use('/api/v1/videos',videoRoutes)
app.use('/api/v1/comments',commentRoutes)
app.use('/api/v1/tweets',tweetRoutes)
app.use('/api/v1/likes',likeRoutes)
app.use('/api/v1/playlists',playlistRoutes)

// the url looks like http://localhost:5000/api/v1/users/register 
export {app};