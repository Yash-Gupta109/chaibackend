import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user = req.user._id
    const {content} = req.body
    if(!isValidObjectId(user)) {
        throw new ApiError(400, "User not found");
    }
    if(!content || content.trim().length === 0){
        throw new ApiError(400, "content is required");
    }
    const tweet =await Tweet.create({content, owner: user})

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "New Tweet created")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!userId?.trim() || !isValidObjectId(userId)){
        throw new ApiError(404, "Not get userId in getUserTweets")
    }
    const tweets =await Tweet.find({owner: userId})
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, "User's all tweets fetched successfully")
    )
    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    if(!tweetId?.trim() || !isValidObjectId(tweetId)){
        throw new ApiError(404, "tweetId not found in updateTweet")
    }
    const updatedTweet = await Tweet.findOneAndUpdate(
        {_id: tweetId},
        {
            $set: {
                content
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!tweetId?.trim() || !isValidObjectId(tweetId)){
        throw new ApiError(404, "tweetId not found in deleteTweet")
    }
    await Tweet.findByIdAndDelete({_id: tweetId})
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}