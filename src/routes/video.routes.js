import { Router } from "express";
import { deletedVideo, getAllVideos, getVideoById, publishVideo, updateVideo } from "../controllers/vedio.controller";
import { verifyJwt } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router =Router();
router.use(verifyJwt)   // apply verify middleware to all routes
// vedio routes
router.route("/allvideo").get(getAllVideos).post(upload.fields([
    {
        name:"videoFile",
        maxCount:1,
    },
    {
        name:"thumbnail"
    },
]),publishVideo)
router
.route("/:videoId")
.get(getVideoById)
.delete(deletedVideo)
.patch(upload.single("thumbnail",updateVideo))

