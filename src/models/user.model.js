import mongoose from 'mongoose';

import jwt from 'jsonwebtoken'
/*    ***   JWT
JWT (bearer token which bear token give access) is a compact, secure token used to authenticate users and authorize access to protected resources in a stateless way.
 Jwt consists of three parts-
 HEADER.PAYLOAD.SIGNATURE
   |       |       |
ALGOINFO  USERDATA  HEADER+PAYLOAD+SECRET_KEY
************ JWT uses signing, not encryption. *********
 */

import bcrypt from 'bcrypt'
/**  BCRYPT 
 * bcrypt is a Node.js package used to securely hash passwords before storing them in the database to protect user credentials from unauthorized access.
 * password = "123456"
salt = "@#9x"
final = "123456@#9x"

 */


const userSchema = new mongoose.Schema(
    {
       userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
       },
       email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
       },

       fullName:{
        type:String,
        required:true,
        trim:true,
        index:true,
       },

       avatar:{
        type:String,  // cloudinary url
        required:true,
       },
       
       coverImage:{
        type:String, // cloudinary url
       },

       watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
       }],

       password:{
        type:String,
        required:[true,"Password is required"],
       },

       refreshToken:{
        type:String,
       },

       createdAt:{
       type:Date,
       default:Date.now,
       },

       updatedAt:{
        type:Date,
        default:Date.now,
       }
    },{timestamps:true});

    // userSchema.pre("save",()=>{
     //        ****  CALLBACK FUNCTION NEVER USED IN THAT WAY IN PRE PLUGINS BEACUSE IN THAT TYPE OF CALLBACK WE CANNT USE THIS(refrence) it doesn't know the context of user 
    // })

// we only want this code to run when password is modified
    userSchema.pre("save",async function (next){
        if(!this.isModified("password")) return ;   
        this.password = await bcrypt.hash(this.password,10)
       
    })

    // checks the password this.password encrypted == password user given return true or false
    userSchema.methods.isPasswordCorrect = async function (password){
     return await bcrypt.compare(password,this.password)  
    }

    // GENERATING ACCESS TOKEN (short lived)
    // Access token = access APIs
    // Refresh token = renew access
    userSchema.methods.generateAccessToken = function(){
        // PAYLOAD
     return  jwt.sign({
            _id:this._id,
            userEmail:this.email,
            userName:this.userName,
            fullName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    }

    // GENRATING REFRESH TOKEN (long lived) {user not alaways have to authenticate himself but user have refresh token and also stored in db if they matches after user hits a endpoint then it gets access of resource and new access token is generated }
    userSchema.methods.generateRefreshToken = function(){
        return  jwt.sign({
            _id:this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    }
    
export const User = mongoose.model('User',userSchema);