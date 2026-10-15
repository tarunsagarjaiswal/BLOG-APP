const { verifyJWT } = require("../utils/generateToken");

const verifyUser = async (req, res, next) => {
  try {
    // console.log(req.headers.authorization)  //out => Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbGxAZ21haWwuY29tbiIsImlkIjoiNmE4YzM1ODliNzg3MWJlZTgxNjQxYjI4IiwiaWF0IjoxNzg3NTczNjQxfQ.1vHGBJRaIVu0cYrj0kVoQjaLKeHYQXoyEiPKRFdEAJw

    let token = req.headers.authorization.split(" ")[1];
    // console.log(token)
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "please, sign in",
      });
    }

    let user = await verifyJWT(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid User",
      });
    }

    // console.log(user)
    req.user = user.id; //custom req method
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = verifyUser;
