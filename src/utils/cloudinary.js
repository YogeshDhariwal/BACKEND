import {v2 as cloudinary} from 'cloudinary'
import fs from  'fs'



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY , 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    })

  // we get file from the local system and upload to cloudinary and if the upload is successful we delete the file from local system
const uploadOnCloudinay = async (localFilePath)=>{
    try {
      if(!localFilePath){
        throw new Error ("File path is required")
      }  
      // upload the file on cloudinary
    const response= await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
      })
      // file has been uploaded succesfully

    /**   console.log('File has been uploaded on cloudinary succesfully',response.url);
   console.log('response',response);
    secure_url → show file
      public_id → manage file
      bytes → size
      width/height → optimization
      resource_type → correct API usage
      signature → differnt from the signature used in jwt (It Verify upload)
    */
   
    fs.unlinkSync(localFilePath)  // if sucessfull upload then remove files

      return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)   // remove the locally saved temporary files as the upload operation is failed
        return null;
    }
}

export {uploadOnCloudinay};