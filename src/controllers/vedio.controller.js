import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinay } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose, { set } from "mongoose";

/** get all Videos */
const getAllVideos = asyncHandler(async(req,res)=>{
   const { page=1, limit=10,query,sortBy,sortType,userId} = req.query
   // now get all videos based on query,sort,pagination

   /** get the page,skip,limit in numbers */
   const pageNumber=Number(page)
   const limitNumber= Number(limit)
   const skip = (pageNumber-1)*limitNumber

   /** checking if Video is available to public or not */
   const matchStage = {
    isPublished:true,
   }

   if(matchStage.isPublished==false){
    throw new ApiErrors(400,"This Video is not public is accessed by members only")
   }

   /** seraching a Video by title or description */
   if(query){
    matchStage.$or = [{videoTitle:{$regex:query,$options:'i'}},
        {description:{$regex:query,$options:'i'}}
    ]
   }
  
   /**  searching Video by userId */
  if(userId){
    matchStage.owner=new mongoose.Types.ObjectId(userId)
  }

  /** sort by ascending or descending order */
  const sortStage ={
    [sortBy] : sortType==="asc"?1:-1
  }

  /**pipeline for Video */
  const videos = await Video.aggregate([
    /** stage 1 match */
    {
        /** matches all Videos which are publically available */
        $match:matchStage
      
    },
    /** stage 2 for joining two collection user and Video on basis of owner as localfield and user _id as forgeign field as store the documents in owner field we get after compare user id and owner id 
     * it gives all the info store in document where user _id ==owner id and project only fullname,username,avatar
    */
    {
     $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"owner"
     },
     pipeline:[
        {
            $project:{
            fullName:1,
            userName:1,
            avatar:1
        }
    }
     ]
    },
    /** stage 3 we know that second stage  return array and arr[0] which is of our use*/
    {
    $addFields:{
     ownerDetails:{
        $arrayElementAt:["$owner",0]
     }
    }
    },
    /** paging pipeline */
    {
        $sort:sortStage
    },
    /** facet is used for doing pagination and counting the document using a single pipeline */
    {
        $facet:{
            Videos:[{$skip:skip},{$limit:limitNumber}],
            totalCount:{$count:"count"}
        }
    }
  ])
  const totalVideos = videos[0].totalCount[0]?.count || 0
  const totalPage = Math.ceil(totalVideos/limitNumber) 
  
  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        [videos[0],totalVideos,totalPage],
        "All Videos fatched successfully"
    )
  )

})

/** publish Video  */
const publishVideo = asyncHandler(async(req,res)=>{
    const {videoTitle,description}=req.body
    /** get Video,upload on cloudinary,create Video */
    const videoLocalPath=req.files?.videoFile[0]?.path
    if(!videoLocalPath){
        throw new ApiErrors(400,"The Video file doesn't exists")
    }

    const video = await uploadOnCloudinay(videoLocalPath)
    if(!video){
        throw new ApiErrors(400,"Video is required")
    }

    const videoDocument= await Video.create({
       videoTitle,
       description,
       video:video.url,
    })
    /** checking Video uploaded succesfully or not */
    if(!videoDocument){
        throw new ApiErrors(500,"something went working while creating Video")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,videoDocument,"Video is uploaded and saved in DB successfully")
    )
})

/** get vedio By Id */
const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiErrors(400,"Invalid video Id")
    }

    const video = await Video.findById(videoId)
    if(!video){
       throw new ApiErrors(404,"This video doesn't exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video feteched successfully")
    )
})
/** update Video */
 const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} =req.params
    /** update Video details like title,description,thumbnail */
    const {videoTitle,description,thumbnail}=req.body
    if(!videoTitle && ! description && !thumbnail){
     throw new ApiErrors(401,"Atlest one field must be updated")
    }
    const video=await Video.findByIdAndUpdate(
       videoId,
        {
     $set:{videoTitle,description,thumbnail}
        },
        {new:true}
    )
  if(!video){
    throw new ApiErrors(404,"The Video is not found")
  }
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video details updated successfully")
    )
 })

/** delete Video */
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId}= req.params
    
     if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiErrors(400, "Invalid video ID")
    }
    
    /** find video by id and then delete */
   const video = await Video.findById(videoId)
   if(!video){
    throw new ApiErrors(405,"Video not found")
   }
   
  await video.deleteOne()
   return res
   .status(200)
   .json(
    new ApiResponse(200,{},"video is deleted succesfully")
   )
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo
}