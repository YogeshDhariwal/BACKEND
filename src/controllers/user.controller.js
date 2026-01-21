import { asyncHandler } from "../utils/asyncHandler.js";
import  { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinay} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{
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

  const {userName,email,fullName,password} = req.body
    console.log('email',email);
    console.log('req body',req.body);
    // step 2
    if(
        [userName,email,fullName,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiErrors(400,"All fields are required");
    }

// step 3
    const existedUser = await User.findOne({
        $or:[{userName},{email}]
    })

    if(existedUser){
        throw new ApiErrors(409,"User already exists");
    }
     
    console.log('existed user',existedUser);

// step 4
   
    const avatarLocalPath = req.files?.avatar[0]?.path; // gives actual path of the file stored in local storage by multer
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiErrors(400,"Avatar is required");
    }
  
    console.log('request file',req.files);
    
    // step 5 upload on cloudinary
  
  const avatar = await uploadOnCloudinay(avatarLocalPath)
  const coverImage = await uploadOnCloudinay(coverImageLocalPath)
  if(!avatar){
    throw new ApiErrors(400,'Avatar is required')
  }

  // step 6 
 const user = await  User.create({
    userName:userName.toLowerCase(),
    fullName,
    avatar:avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
   })

   // checking if user is created or not and removing password and refreshtoken field
const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken" 
)

if(!createdUser){
    throw new ApiErrors(500,"Something went wrong while registering the user")
}

//  return response
   return res.status(201).json(
    new ApiResponse(201,createdUser,"Registered Successfully")
   )
})



export {registerUser};