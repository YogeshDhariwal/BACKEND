import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiErrors } from '../utils/ApiErrors.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Subscription } from '../models/subsciption.model.js'
import { User } from '../models/user.model.js'

/** toggle subscription */
const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId}=req.params

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiErrors(400,"Invalid channelId")
    }

     if( !(await Subscription.findOne({subscriber:req.user._id}))){
    const subscription = await Subscription.create({
        subscriber: req.user._id,
        channel:channelId
    })
    if(!subscription){
        throw new ApiErrors(404,"something went wrong while creating subscription")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, subscription,"Subscribed successfully")
    )
     }
     else{
        const subsciption = await Subscription.findOneAndDelete(
          { subscriber :new mongoose.Types.ObjectId(req.user._id)}
        )
        
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Unsubscribed successfully")
        )
     }

})

/** get channel subscriber  */
const getUserChannelSubscriber= asyncHandler(async(req,res)=>{
    const {channelId} = req.params

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiErrors(400,"Invalid channelId")
    }

    const subscriber = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"Subscriber",
                pipeline:[
                    {
                        $project:{
                            userName:1,
                            fullName:1,
                            email:1,
                        }
                    }
                ]
            }
        },
        {
            $facet:{
                subscriber:[],
                totalCount:[{$count:"count"}]
            }
        }
    ])

    const totalSubscriber = subscriber[0].totalCount[0]?.count || 0

    return res
    .status(200)
    .json(
        new ApiResponse(200,[
          subscriber[0],
         totalSubscriber
        ],
        "All subscriber fetched successfully"
    )
    )
})   

/** channel list of the which user has subscribed */

const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const {subscriberId} = req.params

    if(!mongoose.Types.ObjectId.isValid(subscriberId)){
        throw new ApiErrors(400,"Invalid subscriberId")
    }

    const subscribedBy = await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedChannels",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            userName:1,
                            email:1
                        }
                    }
                ]
            }

        },
        {
            $facet:{
                subscribedByYou:[],
                totalCount:[{$count:"count"}]
            }
        }
    ])

    const totalCountSubscribedByYou = subscribedBy[0].totalCount[0]?.count ||0
    return res
    .status(200)
    .json(
        new ApiResponse(200,[
         subscribedBy[0],
         totalCountSubscribedByYou
        ],
        "All channel that you subscribed by you is fetched successfully"
    )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels
}