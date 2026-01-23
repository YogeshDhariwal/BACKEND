import mongoose, { model } from "mongoose"

const subscriptionSchema = new mongoose.Schema(
    {
      subscriber :{
        type: mongoose.Schema.Types.ObjectId,  // one who is subscribing
        ref:"User",
        unique :true,
      },
      channel :{
       type: mongoose.Schema.Types.ObjectId , // who gets subscriber
       ref: "User",
      }
  }
    ,{timestamps:true})

    export const Subscription = mongoose.model("Subscription",subscriptionSchema)