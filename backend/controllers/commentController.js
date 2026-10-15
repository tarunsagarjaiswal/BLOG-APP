const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const { generateJWT, verifyJWT, decodeJWT } = require("../utils/generateToken");

async function commentBlog(req, res) {
  try {
    const blogId = req.params.id;
    const creator = req.user;

    const { comment } = req.body;
    if (!comment || comment.length <= 0) {
      return res.status(400).json({
        success: false,
        message: "Write comment first befor creating it..",
      });
    }

    const blog = await Blog.findById({ _id: blogId });
    if (!blog) {
      return res.status(400).json({
        success: false,
        message: "Blog does not exist",
      });
    }

    const newComment = await Comment.create({
      comment: comment,
      blog: blogId,
      user: creator,
    }).then((it) => {
      return it.populate({
        path: "user",
        select : "name email",
      })
    });

    await Blog.findByIdAndUpdate(
      blogId,
      { $push: { comments: newComment._id } },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "comment added successfully",
      newComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteComment(req, res) {
  try {
    const commentId = req.params.id;
    const userId = req.user;

    const comment = await Comment.findById({ _id: commentId }).populate({
      path: "blog",
      select: "creator",
    });

    console.log(comment);

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "You didnt commented on this blog..",
      });
    }

    if (comment.user != userId || comment.blog.creator != userId) {
      return res.status(400).json({
        success: false,
        message: "You didnt commented and not authorizes for this blog..",
      });
    }

    await Comment.findByIdAndDelete({ _id: commentId });
    await Blog.findByIdAndUpdate(
      comment.blog,
      { $pull: { comments: commentId } },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "You deleted the comment succefully...",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function editComment(req, res) {
  try {
    const commentId = req.params.id;
    const creator = req.user;

    const comment = await Comment.findById({ _id: commentId});
    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "You have given wrong comment id..",
      });
    }

    if(comment.user.toString() !== creator.toString()) {
         return res.status(400).json({
        success: false,
        message: "You didnt commented on this blog..",
      });
    }

    await Comment.findByIdAndUpdate(commentId, {$set : req.body}, {new : true});
     return res.status(200).json({
        success: false,
        message: "comment eidted successfully",
        comment
      });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function likeComment(req, res) {
  try {
    const commentId = req.params.id;
    const creator = req.user;

    const comment = await Comment.findById({ _id: commentId });
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "comment does not exist",
      });
    }

    if (!comment.likes.includes(creator)) {
      await Comment.findByIdAndUpdate(
        commentId,
        { $push: { likes: creator } },
        { new: true },
      );

      return res.status(200).json({
        success: true,
        message: "comment liked successfully",
        comment
      });
    } else {
      await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likes: creator } },
        { new: true },
      );

      return res.status(200).json({
        success: true,
        message: "comment disliked successfully",
        comment
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { commentBlog, deleteComment, editComment, likeComment };

