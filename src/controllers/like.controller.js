import mongoose from "mongoose"
import { Like } from '../models/like.model.js'
import { ApiErrors } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

/** TOGGLE LIKE ON VIDEO */
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(videoId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiErrors(404, "videoID or userID is not valid")
    }
    /** find video  */
    const video = await Video.findOne(
        {
            _id: videoId,
            isPublished: true
        })

    if (!video) {
        throw new ApiErrors(400, "video is not exists")
    }

    /** find like is creatd or not */
    const existingLike = await Like.findOne({
        atVideo: videoId,
        likedBy: userId
    })

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id })

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Liked Removed successfully")
            )
    }

    /** if like document does not exists */
    const like = await Like.create({
        atVideo: videoId,
        likedBy: userId,
    })
    if (!like) {
        throw new ApiErrors(500, "something went wrong while creating like document")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(201, like, "video is liked successfully")
        )
})

/**TOGGLE LIKE ON COMMENT */
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiErrors(404, "commentID or userID is not valid")
    }
    /** find video  */
    const comment = await Comment.findOne(
        {
            _id: commentId,
            owner: userId
        })

    if (!comment) {
        throw new ApiErrors(400, "video is not exists")
    }

    /** find like is creatd or not */
    const existingLike = await Like.findOne({
        atComment: commentId,
        likedBy: userId
    })

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id })

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Liked Removed successfully from comment")
            )
    }

    /** if like document does not exists */
    const like = await Like.create({
        atComment: commentId,
        likedBy: userId,
    })
    if (!like) {
        throw new ApiErrors(500, "something went wrong while creating like document")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(201, like, "Comment is liked successfully")
        )
})

/** TOGGLE LIKE ON TWEET */
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(tweetId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiErrors(404, "tweetID or userID is not valid")
    }
    /** find tweet  */
    const tweet = await Tweet.findOne(
        {
            _id: tweetId,
            owner: userId
        })

    if (!tweet) {
        throw new ApiErrors(400, "tweet is not exists")
    }

    /** find like is creatd or not */
    const existingLike = await Like.findOne({
        atTweet: tweetId,
        likedBy: userId
    })

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id })

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Liked Removed successfully from tweet")
            )
    }

    /** if like document does not exists */
    const like = await Like.create({
        atTweet: tweetId,
        likedBy: userId,
    })
    if (!like) {
        throw new ApiErrors(500, "something went wrong while creating like document")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(201, like, "Tweet is liked successfully")
        )

})

/** GET ALL LIKED VIDEO*/
const getLikedVideos = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    /** we will just count the count the documents which match with the videoId in the like collection */
   if(!mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiResponse(404,"Invalid videoId")
   }

   const video  = await Video.findOne({
    _id:videoId,
    isPublished:true
   })

   if(!video){
    throw new ApiErrors(400,"Video not found or is private")
   }
   const like = await Like.aggregate([
    {
        $match:{
            atVideo:new mongoose.Types.ObjectId(videoId)
        }
    },
    /** stage 2 */
    {
   $lookup:{
    from:"videos",
    localField:"atVideo",
    foreignField:"_id",
    as:"videoDetail",
    pipeline:[
    {$project:{
        description:1,
        videoTitle:1,
        videoFile:1
    }}
    ]
   }
    },
    /** addField */
    {
    $addFields:{
        videoDetail:{
            $arrayElemAt:["$videoDetail",0]
        }
    }
    },
    /** count videos */
    {
        $facet:{
            like:[],
            totalcount:[{$count:"count"}]
        }
    }
   ])
 const totalLikedVideos=like[0].totalcount[0]?.count || 0
 
 return res
 .status(200)
 .json(
    new ApiResponse(200,{
       LikeDetails: like[0],
      totalLikedVideos:totalLikedVideos
    },"All Liked Videos Fetched Successfully")
 )


})


export {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
}