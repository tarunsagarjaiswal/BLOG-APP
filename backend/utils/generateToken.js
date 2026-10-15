const jwt = require("jsonwebtoken");
require("dotenv").config()

async function generateJWT(payload) {
    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY);
    return token;
}

async function verifyJWT(token) {
    try {
        const data = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        return data;
    } catch (error) {
        return false
    }
}

async function decodeJWT(token) {
    const decoded = await jwt.decode(token);
    return decoded;
}

module.exports = {generateJWT, verifyJWT, decodeJWT};