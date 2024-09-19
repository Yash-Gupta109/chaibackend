import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscriptions.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId?.trim() || !mongoose.isValidObjectId(channelId)){
        throw new ApiError(404, "channel not found");
    }
    const user = req.user?._id;
    if(!user){
        throw new ApiError(400, "You need to login first");
    }
    const subscription = await Subscription.findOne({
        subscriber: user,
        channel: channelId 
    })
    if(subscription){
        await Subscription.deleteOne({ _id: subscription._id });
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Unsubscribed successfully")
        )
    }
    else{
        await Subscription.create(
            {
                subscriber: user,
                channel: channelId
            }
        )
        return res
        .status(200)
        .json(
            new ApiResponse(201, {}, "Subscribed successfully")
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    if(!subscriberId?.trim() || !mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(404, "Channel not found");
    }
    const subscribers = await Subscription.find({channel: subscriberId}).populate('subscriber', 'username');
    
    return res
    .status(200)
    .json(
    new ApiResponse(200, subscribers,"Subscriber Details fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if(!channelId?.trim() || !mongoose.isValidObjectId(channelId)){
        throw new ApiError(404, "subscriberId not found");
    }
    const subscribedChannels = await Subscription.find({subscriber: channelId}).populate('channel', 'username');
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribedChannels, "subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}