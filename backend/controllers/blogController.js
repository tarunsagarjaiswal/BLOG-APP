const Blog = require("../models/blogSchema");
const fs = require("fs");
// const uniqid = require("uniqid");
const ShortUniqueId = require("short-unique-id");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const { generateJWT, verifyJWT, decodeJWT } = require("../utils/generateToken");
const { uploadImage, deleteFromCloudinary } = require("../utils/uploadImages");

async function getBlog(req, res) {
  try {
    const blogId = req.params.blogId;
    
    const getBlog = await Blog.findOne({ blogId: blogId })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "creator",
        select: "name email",
      })
      .lean(); // Converts to a plain JS object so we can mutate it freely

    if (!getBlog) {
      return res.status(404).json({
        message: "BLOG NOT FOUND",
      });
    }

    // Recursive function to deeply populate all nested replies
    async function populateReplies(commentsArray) {
      if (!commentsArray || commentsArray.length === 0) return commentsArray;

      for (let i = 0; i < commentsArray.length; i++) {
        let currentComment = commentsArray[i];

        // If this comment has replies (array of ObjectIds)
        if (currentComment.replies && currentComment.replies.length > 0) {
          
          // 1. Fetch the full comment documents for these ObjectIds 
          const fetchedReplies = await Comment.find({ _id: { $in: currentComment.replies } })
            .populate({
              path: "user",
              select: "name email"
            })
            .lean();

          // 2. Recursively populate the replies of these newly fetched replies
          currentComment.replies = await populateReplies(fetchedReplies);
        }
      }
      return commentsArray;
    }

    // Trigger the recursive function on the top-level comments
    getBlog.comments = await populateReplies(getBlog.comments);

    return res.status(200).json({
      message: "Blog fetched successfully",
      getBlog,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getBlogs(req, res) {
  try {
    const getBlogs = await Blog.find({ draft: false })
      .populate({
        path: "creator",
        select: "name", //only shows the name attribute in creator document present inside user collection
        // select : "-password"        //-password means dont show the password field
      })
      .populate({
        path: "likes",
        select: "email name",
      })
      .populate({
        path: "comments",
        select: "comment user",
      });

    if (!getBlogs)
      return res.status(200).json({
        message: "Add some Blog before fetching it",
      });

    return res.status(200).json({
      message: "Blogs fetched successfully",
      getBlogs,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function createBlog(req, res) {
  try {
    // req.user our custom method which we have make in auth.js for verifying user
    const creator = req.user;

    const { title, description, draft } = req.body;
    const { image, images } = req.files;

    console.log(image);

    const content = JSON.parse(req.body.content);

    if (!title) {
      return res.status(400).json({ message: "please fill the title" });
    }

    if (!description) {
      return res.status(400).json({ message: "please fill the description" });
    }

    if (!image) {
      return res.status(400).json({ message: "please upload the imagee" });
    }

    if (!content) {
      return res.status(400).json({ message: "Please write the Content" });
    }

    const { randomUUID } = new ShortUniqueId({ length: 10 });
    const blogId =
      title.toLowerCase().split(" ").join("-") + "-" + randomUUID();
    console.log(blogId); //creating route for a particular blog in frontend

    let imageIdx = 0;
    for (let i = 0; i < content.blocks.length; i++) {
      let block = content.blocks[i];
      if (block.type == "image") {
        // console.log(images[imageIdx]);
        const { secure_url, public_id } = await uploadImage(
          `data:image/jpeg;base64,${images[imageIdx].buffer.toString("base64")}`,
        );

        console.log(secure_url, public_id);
        imageIdx++;

        block.data.file = {
          url: secure_url,
          imageId: public_id,
        };
      }
    }

    const cloudInfo = await uploadImage(
      `data:image/jpeg;base64,${images[0].buffer.toString("base64")}`,
    );

    const { secure_url, public_id } = cloudInfo;
    // fs.unlinkSync(image.path);

    const blog = await Blog.create({
      title,
      description,
      draft,
      content,
      creator,
      image: secure_url,
      imageId: public_id,
      blogId: blogId,
    });

    await User.findByIdAndUpdate(
      creator,
      { $push: { blog: blog._id } },
      { new: true },
    );

    return res.status(200).json({
      message: "blog created succefully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function updateBlog(req, res) {
  try {
    const creator = req.user;
    const blogId = req.params.id;

    const {title, description, draft} = req.body;

    const { image, images } = req.files || {};

    const content = req.body.content ? JSON.parse(req.body.content) : null;
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    const blog = await Blog.findOne({ blogId: blogId });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (creator.toString() != blog.creator.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this..",
      });
    }

    const imagesToDelete = (blog.content?.blocks || [])
      .filter((it) => it.type == "image")
      .filter(
        (it) => !existingImages.find(({ url }) => url == it.data.file.url),
      )
      .map((it) => it.data.file.imageId);

    console.log(imagesToDelete);

    /*  Promise.all() is a built-in JavaScript method that takes an array of promises and executes them concurrently (at the exact same time) rather than waiting for each one to finish before starting the next. */
    if(imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map(public_id => deleteFromCloudinary(public_id))
      )
    }

    if (images && content && content.blocks) {
      let imageIdx = 0;
      for (let i = 0; i < content.blocks.length; i++) {
        let block = content.blocks[i];
        if (block.type == "image" && block.data.file.image) {
          
          const { secure_url, public_id } = await uploadImage(
            `data:image/jpeg;base64,${images[imageIdx].buffer.toString("base64")}`,
          );

          console.log(secure_url, public_id);
          imageIdx++;

          block.data.file = {
            url: secure_url,
            imageId: public_id,
          };
        }
      }
    }

    if (image != undefined) {
      await deleteFromCloudinary(blog.imageId);
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${image[0].buffer.toString("base64")}`,
      );
      blog.image = secure_url;
      blog.imageId = public_id;
    }

    blog.title = title || blog.title
    blog.description = description || blog.description
    blog.draft = draft || blog.draft
    blog.content = content || blog.content 

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "blog updated successfully",
      blog: blog,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteBlog(req, res) {
  try {
    const blogId = req.params.id;
    const creator = req.user;

    const blog = await Blog.findById({ _id: blogId });

    if (!blog) {
      return res.status(400).json({
        success: false,
        message: "Blog does not exist",
      });
    }
    console.log(creator, blog.creator);
    if (creator != blog.creator) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized for this..",
      });
    }

    await deleteFromCloudinary(blog.imageId);

    await Blog.findByIdAndDelete({ _id: blogId });
    await User.findByIdAndUpdate(
      creator,
      { $pull: { blog: blogId } },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function likeBlog(req, res) {
  try {
    const blogId = req.params.id;
    const creator = req.user;

    const blog = await Blog.findById({ _id: blogId });
    if (!blog) {
      return res.status(400).json({
        success: false,
        message: "Blog does not exist",
      });
    }

    if (!blog.likes.includes(creator)) {
      await Blog.findByIdAndUpdate(
        blogId,
        { $push: { likes: creator } },
        { new: true },
      );

      return res.status(200).json({
        isLiked: true,
        success: true,
        message: "blog liked successfully",
      });
    } else {
      await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { likes: creator } },
        { new: true },
      );

      return res.status(200).json({
        isLiked: false,
        success: true,
        message: "blog disliked successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getBlog,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
};
