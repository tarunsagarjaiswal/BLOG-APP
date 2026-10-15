const cloudinary = require("cloudinary").v2;

const uploadImage = async (imgPath) => {
    try {
        const result = await cloudinary.uploader.upload(imgPath, {
            folder : "blog app", //the name of the folder created on your cloudinary website 
        });
        return result;
    } catch (error) {
        console.log(error);
    }
}

const deleteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id)
    } catch (error) {
        console.log(error);
    }
}

module.exports =  {uploadImage, deleteFromCloudinary} ;