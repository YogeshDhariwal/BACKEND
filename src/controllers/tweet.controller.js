import mongoose from "mongoose";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";

/** GET ALL TWEETS */
 const getAllTweets = asyncHandler(async(req,res)=>{
    const userId= req.user._id

    if(!(mongoose.Types.ObjectId.isValid(userId))){
        throw new ApiErrors(404,"Invalid user ID")
    }

    const tweet=await Tweet.aggregate([
      /** stage 1 */
        {
        $match:{
            owner:new mongoose.Types.ObjectId(userId)
        }
        },
         /** stage 2: sort latest first */
     {
    $sort: { createdAt: -1 }
     },
        /** stage 3 */
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                 pipeline:[
              { $project:{
                fullName:1,
                userName:1,
                email:1
               }}
            ]
            }
           
        },
        /**  stage 4 */
        {
           $addFields:{
           ownerDetails:{
            $arrayElemAt:["$owner",0]
           }
           }
        },
        /** stage 5 total count */
        {
            $facet:{
                tweets:[],
                totalCount:[
                    {$count:"count"}
                ]
            }
        }

    ])

    const totalTweet = tweet[0].totalCount[0]?.count|| 0

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {
                content:tweet[0],
                tweetsCount:totalTweet
        }
        )
    )
 })

/** POST TWEETS */
  const postTweets =asyncHandler(async(req,res)=>{
      const {content} =req.body

      if(!content){
        throw new ApiErrors(404,"You have to write something,Tweet content is missing ")
      }

       const tweet = await Tweet.create(
        
        {content:content ,
         owner:req.user._id
        }
    )

       if(!tweet){
        throw new ApiErrors(500,"something went wrong while creating tweet")
       }

       return res
       .status(200)
       .json(
        new ApiResponse(201,tweet,"Tweet is created successfully")
       )
  })

/** UPDATE  TWEETS */
   const updateTweets = asyncHandler(async(req,res)=>{            
    const {newContent} = req.body
    const {tweetId}=req.params
    
    if(!newContent || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiErrors(400,"Bhai tweet  and tweetID to de phela")
    }
    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{content:newContent}
        },
          { new :true }
    )
     if(!newTweet){
        throw new ApiErrors(500,"something went wrong while creating Tweet")
     }

     return res
     .status(200)
     .json(
        new ApiResponse(200,newTweet,"Tweet updated successfully")
     )

   })
/** DELETE TWEETS */

const deleteTweets= asyncHandler(async(req,res)=>{
    const {tweetId}= req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiErrors(404,"Tweeet id is not valid or given")
    }

    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiErrors(500,"tweet not found")
    }
    await Tweet.deleteOne()

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Tweet deleted successfully")
    )
})
export{
    getAllTweets,
    postTweets,
    updateTweets,
    deleteTweets
}