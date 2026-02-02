import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

import { user } from "../middlewares/auth.middleware.js"

/** get vedio Comments */
const getVideoComments=asyncHandler(async(req,res)=>{
    const {videoId} =req.params
    const {page=1,limit=10}=req.query
      
    const pageNumber=Number(page)
    const limitNumber=Number(limit)
    const skip=(pageNumber-1)*limitNumber

    /**checking vedio is public or not */
const video =await Video.findOne({
    isPublished:true,
    _id:videoId
})
if(!video){
    throw new ApiErrors(400,"Video not found")
}

const comment =await Comment.aggregate([
    /** 1 Stage */
  {
    $match:{
        video:new mongoose.Types.ObjectId(videoId)
    }
  },
  /** 2 stage */
  {
  $sort:{
    createdAt:-1,
  }
  },
  /** 3  stage */
  {
  $facet:{
    comment:[{$skip:skip},{$limit:limitNumber}],
    totalCount:[{$count:"count"}]
  }
  }
])

/** total Comment */
   const totalComment=comment[0].totalCount[0]?.count || 0

   return res
   .status(200)
   .json(
    new ApiResponse(200,{
        comment,
        totalComment,
        pageNumber
    },"All Comment fetched successfully")
   )
})

/** Add comments */
const addComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {content} =req.body

    if(!content){
        throw new ApiErrors(404,"Comments cann't be empty")
    }

    const video=await Video.findOne({
        isPublished:true,
        _id:videoId
    })

     if (!video) {
    throw new ApiErrors(404, "Video not found or not published");
  }
    const comment = await Comment.create({
        content,
        atVideo:video,
        owner:req.user._id
    }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(201,comment,"Comment posted successfully")
    )
})

/** update comment */
const updateComment =asyncHandler(async(req,res)=>{
/** find  comment id  and just set comment */
  const {newComment}=req.body
  const {commentId}=req.params
  if (!newComment || !commentId) {
    throw new ApiErrors(404,"comment or video id can not be empty ")
  }
 const comment =await Comment.findByIdAndUpdate(
       commentId,
    {
     $set:{content:newComment}
 },
 {new:true}
)

return res
.status(200)
.json(
    new ApiResponse(200,comment,"comment updated successfully")
)

})

/** delete comment */
const deleteComment =asyncHandler(async(req,res)=>{
   const {commentId} = req.params

   if(!mongoose.Types.ObjectId.isValid(commentId)){
    throw new ApiErrors(404,"CommentID is required")
   }

   const comment = await findById(commentId)
   if(!comment){
    throw new ApiErrors(400,"comment not found")
   }

   await Comment.deleteOne()

   return res
   .status(200)
   .json(
    new ApiResponse(200,{},"Comment deleted successfully")
   )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}