import mongoose from "mongoose"
import { ApiErrors } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Playlist} from "../models/playlist.model.js"

/** get user playlist*/
const getUserPlaylist =asyncHandler(async(req,res)=>{
    const {userId }= req.params

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiErrors(400,"UserId is required or invalid id")
    }

    const userPlaylist = await Playlist.aggregate([
        {
            $match:  new mongoose.Types.ObjectId(userId)
            
        },
        /** 2 stage */
        {
         $lookup:{
            from:"videos",
            localField:"video",
            foreignField:"_id",
            as:"videoDetail",
            pipeline:[
                {
                    $project:{
                        videoTitle:1,
                        description:1,
                        videoFile:1
                    }
                }
            ]

         }
        },
        {
        $addFields:{
            AboutVideos:{
                $arrayElemAt:["$videoDetails",0]
            }
        }
        },
        {
            $facet:{
                Playlists:[],
                totalCount :[{$count:"count"}]
            }
        }
    ])

    const totalPlaylist = userPlaylist[0].totalCount[0]?.count || 0

    return res
    .status(200)
    .json(
        new ApiResponse(200,
           [ userPlaylist[0],
            totalPlaylist
        ],
        "All user playlists are fetched successfully"
        )
    )
})
/** create playlist */
const createPlaylist = asyncHandler(async(req,res)=>{
    const{name,description} =req.body
     
    if(!name || !description){
        throw new ApiErrors(400,"Playlist name and description are required")
    }

     const playlist = await Playlist.create(
        {
            name:name,
            description:description,
            owner:req.user._id,
        }
     )

     if(!playlist){
        throw new ApiErrors(500,"something went wrong! while creating playlist document")
     }

     return res
     .status(200)
     .json(
        new ApiResponse(201,playlist,"playlist is created successfully")
     )
})

/** add video playlist */
const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const{videoId,playlistId}=req.params

    if(!videoId || !playlistId){
        throw new ApiErrors(400,"videoId and playlistId are required")
    }

    const playlistExist = await Playlist.findByIdAndUpdate(
        {_id: new mongoose.Types.ObjectId(playlistId)},
    {
        $set:{
            video:new mongoose.Types.ObjectId(videoId)
        }
    },
    {new :true}
)
 
   if(!playlistExist){
    throw new ApiErrors(404,"Playlist not found")
   }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlistExist,"Video is successfully added to the playlist")
    )

})

/** remove video from playlist */
const removeVideoFromPlaylist =asyncHandler(async(req,res)=>{
   const {playlistId,videoId}=req.params
   
   if(!mongoose.Types.ObjectId.isValid(playlistId)|| !mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiErrors(400,"Invalid playlistID or VideoID")
   }

   const playlistVideo = await Playlist.findOne({
    _id:new mongoose.Types.ObjectId(playlistId),
   video: new mongoose.Types.ObjectId(videoId)
   })
    if(!playlistVideo){
        throw new ApiErrors(404,"video is not found")
    }
    await Playlist.deleteOne({
        video:new mongoose.Types.ObjectId(videoId)
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlistVideo,"Video is removed successfully from playlist")
    )
})

/** delete playlist */
const deletePlaylist =asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiResponse(400,"Invalid playlist Id")
    }

    const playlist =await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiErrors(404,"Playlist not found")
    }

    await Playlist.deleteOne()

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Playlist is deleted successfully")
    )
})


/** update Playlist */
const updatePlaylist=asyncHandler(async(req,res)=>{
    const{playlistId}=req.params
    const {newDescription,newName}=req.body

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiErrors(400,"invalid playlistId")
    }
    if(!newName || !newDescription){
        throw new ApiErrors(400,"Name and description are required")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId,{
        $set:{
            name:newName,
            description:newDescription
        }
    },
    {new:true}
)

if(!playlist){
    throw new ApiErrors(500,"something went wrong ! while updating playlist")
}

return res
.status(200)
.json(
    new ApiResponse(200,playlist,"playlist updated successfully")
)
})

export {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    getUserPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist
}