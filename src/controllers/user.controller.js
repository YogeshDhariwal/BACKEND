import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinay } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

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
     *  send response tokens (Access,Refresh) in cookies
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

    // send tokens in form of cookies
    //we can not send password to user and refresh token in response body
    // Refresh token send in onllt httponly cookies to protect token from theft

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
       3. remove cookies form user
       4.logout succesfully
    */
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
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
    // clear cookies
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

// REFRESHING ACCESS TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from cookies
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
          .cookies("refreshToken", newRefreshToken, options)
          .cookies("accessToken", accessToken, options)
          .json(
              new ApiResponse(200,
                  {
                      accessToken, refreshToken: newRefreshToken
                  },
                  "Access token refreshed successfully"
              )
          )
  } catch (error) {
    throw new ApiErrors(401,error?.message || "Invalid refresh token")
  }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
};