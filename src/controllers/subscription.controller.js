import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId?.trim()){
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
        await subscription.remove();
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
    const {channelId} = req.params
    if(!channelId.trim()){
        throw new ApiError(404, "Channel not found");
    }
    const subscribers = await Subscription.find({channel: channelId}).populate('subscriber', 'username');

    if(subscribers){
        return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers,"SubscriberCount fetched successfully")
        )
    }
    else{
        return res
        .status(200)
        .json(
            new ApiResponse(200, [{}],"You have 0 subscibers")
        )
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new ApiError(404, "subscriberId not found");
    }
    const subscribedChannels = await Subscription.find({subscriber: subscriberId}).populate('channel', 'username');
    
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