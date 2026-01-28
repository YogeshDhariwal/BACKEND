import { asyncHandler } from "../utils/asyncHandler.js";
import { Vedio } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinay } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/** get all vedios */
const getAllVedios = asyncHandler(async(req,res)=>{
   const { page=1, limit=10,query,sortBy,sortType,userId} = req.query
   // now get all videos based on query,sort,pagination

   /** get the page,skip,limit in numbers */
   const pageNumber=Number(page)
   const limitNumber= Number(limit)
   const skip = (pageNumber-1)*limitNumber

   /** checking if vedio is available to public or not */
   const matchStage = {
    isPublished:true,
   }

   if(matchStage.isPublished==false){
    throw new ApiErrors(400,"This vedio is not public is accessed by members only")
   }

   /** seraching a vedio by title or description */
   if(query){
    matchStage.$or = [{videoTitle:{$regex:query,$options:'i'}},
        {description:{$regex:query,$options:'i'}}
    ]
   }
  
   /**  searching vedio by userId */
  if(userId){
    matchStage.owner=new mongoose.Types.ObjectId(userId)
  }

  /** sort by ascending or descending order */
  const sortStage ={
    [sortBy] : sortType==="asc"?1:-1
  }

  /**pipeline for vedio */
  const vedios = await Vedio.aggregate([
    /** stage 1 match */
    {
        /** matches all vedios which are publically available */
        $match:matchStage
      
    },
    /** stage 2 for joining two collection user and vedio on basis of owner as localfield and user _id as forgeign field as store the documents in owner field we get after compare user id and owner id 
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
            vedios:[{$skip:skip},{$limit:limitNumber}],
            totalCount:{$count:"count"}
        }
    }
  ])
  const totalVedios = vedios[0].totalCount[0]?.count || 0
  const totalPage = Math.ceil(totalVedios/limitNumber) 
  
  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        [vedios[0],totalVedios,totalPage],
        "All vedios fatched successfully"
    )
  )

})

/** publish vedio  */
const publishVedio = asyncHandler(async(req,res)=>{
    const {vedioTitle,description}=req.body
    /** get vedio,upload on cloudinary,create vedio */
    const vedioLocalPath=req.files?.vedioFile[0]?.path
    if(!vedioLocalPath){
        throw new ApiErrors(400,"The vedio file doesn't exists")
    }

    const vedio = await uploadOnCloudinay(vedioLocalPath)
    if(!vedio){
        throw new ApiErrors(400,"Vedio is required")
    }

    const vedioDocument= await Vedio.create({
       vedioTitle,
       description,
       vedio:vedio.url,
    })
    /** checking vedio uploaded succesfully or not */
    if(!vedioDocument){
        throw new ApiErrors(500,"something went working while creating vedio")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,createdVedio,"vedio is uploaded and saved in DB successfully")
    )
})


/** update vedio */
/** find vedio */
/** delete vedio */

export {
    getAllVedios,
    publishVedio
}