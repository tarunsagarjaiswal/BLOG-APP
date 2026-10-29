const cloudinary = require("cloudinary").v2;

const uploadImage = async (imgPath) => {
  try {
    const result = await cloudinary.uploader.upload(imgPath, {
      folder: "blog app",
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error(error.message || "Failed to upload image to Cloudinary");
  }
};

const deleteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id)
    } catch (error) {
        console.log(error);
    }
}

module.exports =  {uploadImage, deleteFromCloudinary} ;