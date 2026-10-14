const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv")

dotenv.config();

async function cloudinaryConfig(params) {
    try {
        cloudinary.config({
        cloud_name : process.env.CLOUD_NAME,
        api_key : process.env.CLOUDINARY_API_KEY,
        api_secret : process.env.CLOUDINARY_API_SECERT
    })
    console.log("clodinary set up success");
    } catch (error) {
        console.log("error while setting up cloudinary");
        console.log(error);
    }   
}

module.exports = cloudinaryConfig;