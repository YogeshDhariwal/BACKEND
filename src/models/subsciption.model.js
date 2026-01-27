import mongoose, { model } from "mongoose"

const subscriptionSchema = new mongoose.Schema(
    {

      /** by caclulating subsciber in document we can able to find the list of subscribed channel by you */
      subscriber :{
        type: mongoose.Schema.Types.ObjectId,  // one who is subscribing
        ref:"User",
        unique :true,
      },

      /** by calculating channel we can able to  calculate total no of subscriber o channel have */
      channel :{
       type: mongoose.Schema.Types.ObjectId , // who gets subscriber
       ref: "User",
      }
  }
    ,{timestamps:true})

    export const Subscription = mongoose.model("Subscription",subscriptionSchema)