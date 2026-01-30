import { Router } from "express";
import { deleteVideo,
     getAllVideos,
      getVideoById, publishVideo, updateVideo } from "../controllers/vedio.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

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
.delete(deleteVideo)
.patch(upload.single("thumbnail",updateVideo))

export default router
