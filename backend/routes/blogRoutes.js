const express = require("express");
const { getBlogs, createBlog, getBlog, updateBlog, deleteBlog, likeBlog} = require("../controllers/blogController");
const verifyUser = require("../middlewares/auth");
const { commentBlog, deleteComment, editComment, likeComment } = require("../controllers/commentController");
const upload = require("../utils/multer");
const route = express.Router();     //helps you to perform all the methods, and similar like instance of app that is created by express but you can use route.listen() bcauz it is only handle my the main file app.

// console.log("blog")
let blogs = [];

route.post("/blogs", verifyUser, upload.fields([{ name : "image", maxCount : 1  }, { name : "images"}]), createBlog)

route.get("/blogs", getBlogs)

route.get("/blogs/:blogId", getBlog)

route.patch("/blogs/:id", verifyUser, upload.fields([{ name : "image", maxCount : 1  }, { name : "images"}]), updateBlog)

route.delete("/blogs/:id", verifyUser, deleteBlog)

route.post("/blogs/like/:id", verifyUser, likeBlog);

route.post("/blogs/comment/:id", verifyUser, commentBlog);

route.delete('/blogs/comment/:id', verifyUser, deleteComment)

route.patch('/blogs/edit-comment/:id', verifyUser, editComment)

route.patch('/blogs/like-comment/:id', verifyUser, likeComment)
    
module.exports = route;
