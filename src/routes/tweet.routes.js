import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { deleteTweets, getAllTweets, postTweets, updateTweets } from "../controllers/tweet.controller.js";

const router = Router()
router.use(verifyJwt)

router.route("/getAllTweets").get(getAllTweets)
router.route("/postTweet").post(postTweets)
router
.route("/:tweetId")
.patch(updateTweets)
.delete(deleteTweets)

export default router
