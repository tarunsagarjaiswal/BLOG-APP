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
        select: "name email",
      });
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

    const comment = await Comment.findById(commentId).populate({
      path: "blog",
      select: "creator",
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment does not exist.",
      });
    }

    if (
      comment.user.toString() !== userId.toString() &&
      comment.blog.creator._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment.",
      });
    }

    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $pull: { replies: commentId } }
      );
    } else {
      await Blog.findByIdAndUpdate(
        comment.blog._id,
        { $pull: { comments: commentId } }
      );
    }

    async function deleteCommentAndReplies(id) {
      let currentComment = await Comment.findById(id);

      if (!currentComment) return;

      if (currentComment.replies && currentComment.replies.length > 0) {
        const deletePromises = currentComment.replies.map((replyId) =>
          deleteCommentAndReplies(replyId)
        );
        await Promise.all(deletePromises);
      }

      await currentComment.deleteOne();
    }

    await deleteCommentAndReplies(commentId);

    return res.status(200).json({
      success: true,
      message: "You deleted the comment successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async function editComment(req, res) {
  try {
    const commentId = req.params.id;
    const creator = req.user;
    const { updatedCommentContent } = req.body;

    const comment = await Comment.findById({ _id: commentId });
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "You have given wrong comment id..",
      });
    }

    if (comment.user.toString() !== creator.toString()) {
      return res.status(403).json({
        success: false,
        message: "You didnt commented on this blog..",
      });
    }

    if (!updatedCommentContent) {
      return res.status(400).json({
        success: false,
        message: "You didnt updated your comment..",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { comment: updatedCommentContent },
      { new: true },
    ).then((it) => {
      return it.populate({
        path: "user",
        select: "name email",
      });
    });

    return res.status(200).json({
      success: true,  
      message: "comment edited successfully",
      updatedComment,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
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
        comment,
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
        comment,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function addNestedComment(req, res) {
  try {
    const userId = req.user;
    const { id: blogId, parentCommentId } = req.params;

    const blog = await Blog.findById({ _id: blogId });
    const comment = await Comment.findById(parentCommentId);

    const { reply } = req.body;

    if (!comment) {
      res.status(404).json({
        success: false,
        mesaage: "Parent comment not found",
      });
    }

    if (!blog) {
      res.status(404).json({
        success: false,
        mesaage: "Blog not found",
      });
    }

    const newReply = await Comment.create({
      blog: blogId,
      parentComment: parentCommentId,
      comment: reply,
      user: userId,
    }).then((it) => {
      return it.populate({
        path: "user",
        select: "name email",
      });
    });

    await Comment.findByIdAndUpdate(
      parentCommentId,
      {
        $push: { replies: newReply._id },
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      newReply: newReply,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong from ourside",
    });
  }
}

module.exports = {
  commentBlog,
  deleteComment,
  editComment,
  likeComment,
  addNestedComment,
};
