import { v2 as cloudinary} from "cloudinary"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteImageFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted successfully', result);
    } catch (error) {
        console.error('Error deleting image', error);
    }
}

export {deleteImageFromCloudinary}