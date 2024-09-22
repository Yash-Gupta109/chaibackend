import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to delete image or video from Cloudinary
const deleteMediaFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} deleted successfully`, result);
  } catch (error) {
    console.error(`Error deleting ${resourceType}`, error);
  }
};

export { deleteMediaFromCloudinary };