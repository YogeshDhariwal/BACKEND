import mongoose from "mongoose"

const playlistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        video: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        description: {
            type: String,
            required: true,
        },
       
    }, { timestamps: true })

export const Playlist = mongoose.model("Playlist", playlistSchema)