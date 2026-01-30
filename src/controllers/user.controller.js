import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinay } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // adding refresh token in db
        user.refreshToken = refreshToken

        // when we try to save updated user in db then whole user model is kicking and it require fields like password but we dont have that so we use validateBeforeSave false means no need to check anything just save user in DB 
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiErrors(500, "Something went wrong while generating refresh and access token")
    }
}

// REGISTER
const registerUser = asyncHandler(async (req, res) => {
    /*1.get user details from frontend (using postman or frontend app)
      2. validation - not empty
      3. check if user already exists: username,email
      4 .check for image,check for avatar
      5. upload them to cloudinary ,avatar
      6.create user object - create entry in db
      7.store the user in db
      8.remove password ,refresh token field from response
      9.check user creation
      10. yes send response, no send error   */

    const { userName, email, fullName, password } = req.body
    //   console.log('email',email);
    //   console.log('req body',req.body);
    // step 2
    if (
        [userName, email, fullName, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiErrors(400, "All fields are required");
    }

    // step 3
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiErrors(409, "User already exists");
    }

    //  console.log('existed user',existedUser);

    // step 4

    const avatarLocalPath = req.files?.avatar[0]?.path; // gives actual path of the file stored in local storage by multer
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar is required");
    }

    // console.log('request file',req.files);

    // step 5 upload on cloudinary

    const avatar = await uploadOnCloudinay(avatarLocalPath)
    const coverImage = await uploadOnCloudinay(coverImageLocalPath)
    if (!avatar) {
        throw new ApiErrors(400, 'Avatar is required')
    }

    // step 6 
    const user = await User.create({
        userName: userName.toLowerCase(),
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || " ",
        email,
        password,
    })

    // checking if user is created or not and removing password and refreshtoken field
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiErrors(500, "Something went wrong while registering the user")
    }

    //  return response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "Registered Successfully")
    )
})

//  LOGIN 
const loginUser = asyncHandler(async (req, res) => {
    /** enter data
     *  check  required fields
     * check user exist in db or not
     *  compare the hash password
     * store refresh token,access token in db
     *  send response tokens (Access,Refresh) in cookie
     */

    // step 1
    const { email, userName, password } = req.body
    console.log('email of user', email);

    // step 2
    if (!(email || userName)) {
        throw new ApiErrors(400, "Email or Username is required")
    }


    // step 3
    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (!user) {
        throw new ApiErrors(400, "Error! Inavalid Email or username")
    }

    // step 4 compare passord
    const correctPassword = await user.isPasswordCorrect(password);
    if (!correctPassword) {
        throw new ApiErrors(400, "Invalid Password")
    }

    // step 5 run generateaccessandrefreshtoken method
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    // send tokens in form of cookie
    //we can not send password to user and refresh token in response body
    // Refresh token send in onllt httponly cookie to protect token from theft

    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User logged in Successfully"
            )
        )

})

// LOGOUT
const logoutUser = asyncHandler(async (req, res) => {
    /* 1. Authenticate user( verify jwt access token)
       2. Remove refreshToken from db
       3. remove cookie form user
       4.logout succesfully
    */
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    // clear cookie
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

// REFRESHING ACCESS TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from cookie
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiErrors(401, "Unauthorized request")
    }

    // verify token 
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        // finding user with id having valid refreshToken
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiErrors(401, "Invalid refresh Token")
        }

        // match both tokens
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiErrors(401, "Refersh token is expired or used")
        }

        // generate new token
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

        return res.status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid refresh token")
    }

})

// changing password

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    //  const {oldPassword ,newPassword,confPassword} = req.body
    //  if(!(newPassword == confPassword)){
    //     throw new ApiErrors(400,"WRONG PASSWORD")
    //  }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiErrors(400, "Invalid Password")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password Changed Successfully"
            )
        )
})

// CURRENT USER

const currentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched successfully")
        )
})

//Update Account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body

    if (!email || !fullName) {
        throw new ApiErrors(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { fullName, email }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Account Updated Successfully"
            )
        )
})

// files updation user

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar file not found")
    }

    const avatar = await uploadOnCloudinay(avatarLocalPath)
    console.log('avatar', avatar.url);

    if (!avatar.url) {
        throw new ApiErrors(500, "ERROR while uploading avatar")
    }

  const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200,user, "Avatar Image updated successfully")
        )

})

// cover image update
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.body?.path
    if (!coverImageLocalPath) {
        throw new ApiErrors(400, "Cover image not found")
    }

    const coverImage = await uploadOnCloudinay(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiErrors(400, "ERROR while uploading Cover image ")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover Image updated successfully")
        )
})

// user channel  profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params
    if (!userName?.trim()) {
        throw new ApiErrors(400, "User not found")
    }

    const channel = await User.aggregate([
        /** pipeline for finding the account/like a channel  */
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        /** used to find document which gives the information about the  total subscriber */
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "Total Subscribers"
            }
        },
        /** used to find the document which gives the document as total account you subscribed */
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "Subscribed by you"
            }
        },
        /** gives count of total sunbsccriber and subscribed and info about showing true if subscribed by a user or not */
        {
            $addFields: {
                subscriberCount: {
                    $size: "$Total Subscribers"
                },
                subscribedByYouCount: {
                    $size: "$Subscribed by you"
                },
                isSubscribed:{
                    $cond: {
                        if:{$in: [req.user?._id,"$Total Subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        /** shows which is necessary  */
        {
            $project:{
                fullName: 1,
                userName: 1,
                subscriberCount:1,
                subscribedByYouCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
        }
    }
    ])

    if(!channel?.length){
    throw new ApiErrors(400,"No Such User Exists")
   }

   return res
   .status(200)
   .json(
    new ApiResponse(200,channel[0],"User Channel fetched successfully")
   )

})

//User Watch History
const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            /** we get a string of id and then mongoose convert it into objectid of user
             * finding user by id   1.stage*/
            
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        /** 2.stage finding the documentd which have same vedio id in user schema as in watch history and id in video schema */
        {
            $lookup:{
                from: "videos",
                localField:"watchHistory",
                foreignField: "_id",
                as:"watchHistory",
                /** sub pipelines used because we don't know about owner field so we use another lookup
                 * with the user schema to find about owner
                */
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                           foreignField: "_id",
                           as:"owner",
                           /** another sub pipeline used to show the listed fileds only */
                           pipeline:[
                            {
                                $project:{
                                    fullName:1,
                                    userName:1,
                                    avatar:1
                                }
                            }
                           ]
                        }
                    },
                    /**3.stage  modify the ownenr details in a field called owner details and get the first value in a array */
                    {
                        $addFields:{
                            ownerDetails:{
                               $arrayElemAt:["$owner",0] 
                            }
                        }
                    }
                ]
            }
        },
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"Watch History fetched successfully")
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    currentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};