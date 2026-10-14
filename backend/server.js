// ATLAS   username => dingdingshin67_db_user,  pass => RIc8cEcejfaKOmQl
const express = require("express");
const cors = require("cors")
const dbConnect = require("./config/dbConnect");
const User = require("./models/userSchema");
const userRoute = require("./routes/userRoutes")     // prints user that is written in route file bacuz firstly middleware will run then it goes to the request.
const blogRoute = require("./routes/blogRoutes");    // prints blog that is wriiten in route file bacuz firstly middleware will run then it goes to the request.
const cloudinaryConfig = require("./config/cloudinaryConfig");
const app = express();

//for getting variables from .env file
require("dotenv").config();

// 2. Use the cors middleware (allows all origins by default)
app.use(cors({origin : "http://localhost:5173"}));
app.use(express.json());

// <------------------------- USERS ROUTE ------------------------->
app.use('/api/v1', userRoute);  //in build middleware, connects with your mini-app(userRoute.js, etc.).  

// <------------------------- BLOGS ROUTE ------------------------->
app.use('/api/v1', blogRoute);    //in build middleware    

const PORT = (process.env.PORT || 5000);

app.listen(PORT, () => {
    console.log("server started");
    dbConnect();
    cloudinaryConfig();
})