import { Router } from "express";
import { changeCurrentPassword, 
    currentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
     registerUser,
     updateAccountDetails,
     updateUserAvatar, 
     updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from  "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { verify } from "jsonwebtoken";
const router = Router();

// Register ROUTE
router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)

// lOGIN ROUTE
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJwt , logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJwt,changeCurrentPassword)
router.route("/current-use").get(verifyJwt,currentUser)
router.route("/udpate-account").patch(verifyJwt,updateAccountDetails)
router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateUserAvatar)
router.route("/coverimage").patch(verifyJwt,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:userName").get(verifyJwt,getUserChannelProfile)
router.route("/watch-history").get(verifyJwt,getWatchHistory)



export default router;