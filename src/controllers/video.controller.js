import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { deleteMediaFromCloudinary } from "../utils/cloudinaryDelete.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if([title, description].some((field)=> field.trim() === "")){
        throw new ApiError(400, "All feilds are required");
    }
    const videoLocalPath = req.files?.videoFile[0].path;
    
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail =await uploadOnCloudinary(thumbnailLocalPath)
    let videoDuration = videoFile.duration;
    if(!videoFile || !thumbnail){
        throw new ApiError(400, "All files are required");
    }
    const publishedFiles = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: videoDuration,
        isPublished: true,
        owner: req.user._id
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, publishedFiles, "video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(404, "video not found")
    }
    const videoDetails = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$owner", 0]
                }
            }
        },
        {
            $project: {
                "owner.password": 0,
                "owner.refreshToken": 0
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, videoDetails, "video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    //TODO: update video details like title, description, thumbnail

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(404, "video not found")
    }
    function extractPublicId(url) {
        // Regular expression to match the publicId in the Cloudinary URL
        const pattern = /\/upload\/(?:v\d+\/)?([^\/]+)\./;
        const match = url.match(pattern);
        return match ? match[1] : null;
    }
    const video = await Video.findById(videoId);
    if(req.user?._id.toString() !== video.owner.toString()){
        throw new ApiError(400, "UnAuthorized Access to update video details")
    }

    const localPathThumbnail = req.file?.path;
    const newThumbnailUrl = await uploadOnCloudinary(localPathThumbnail);
    
    if(!newThumbnailUrl.url){
        throw new ApiError(400, "Error while uploading on coverImage")
    }
    await deleteMediaFromCloudinary(extractPublicId(video.thumbnail))
    
    const videoData = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail : newThumbnailUrl.url,
                title,
                description
            }
        },
        {new : true}
    )

    await video.save({ validateBeforeSave: false })
    
    return res
    .status(200)
    .json(new ApiResponse(200, videoData, "video thumbnail updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(404, "Video not found")
    }
    
    function extractPublicId(url) {
        // Regular expression to match the publicId in the Cloudinary URL
        const pattern = /\/upload\/(?:v\d+\/)?([^\/]+)\./;
        const match = url.match(pattern);
        return match ? match[1] : null;
    }
    
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (req.user?._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "Unauthorized access to delete video");
    }

    const deletedVideo =await Video.findByIdAndDelete(videoId);
    const videoPupliId = extractPublicId(deletedVideo.videoFile);
    const thumbnailPublicid = extractPublicId(deletedVideo.thumbnail);
    await deleteMediaFromCloudinary(videoPupliId, 'video')
    await deleteMediaFromCloudinary(thumbnailPublicid)

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedVideo, "Video deleted successfully ")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}