import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {  addVideoToPlaylist,
     createPlaylist,
      deletePlaylist,
       getUserPlaylist,
        removeVideoFromPlaylist,
         updatePlaylist } from "../controllers/playlist.controller.js";

const router =Router()
router.use(verifyJwt)

router.route("/").post(createPlaylist)
router
.route('/:playlistId')
.patch(updatePlaylist)
.delete(deletePlaylist)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)
router.route("/user/:userId").get(getUserPlaylist)

export default router;