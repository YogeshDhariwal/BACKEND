import multer from "multer";

/**   Multer is an Express middleware used for handling file uploads. It parses multipart/form-data      requests, stores uploaded files, and makes them accessible via req.file or req.files. It is commonly used for uploading images, documents, and videos.
 * 
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + "yogi")
  }
})

export const upload = multer({
     storage,
     })