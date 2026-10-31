import { createSlice, current } from "@reduxjs/toolkit";
//for printing the variables in console.log inside the slice in redux, we use current.

const selectedBlogSlice = createSlice({
  name: "selectedBlogSlice",
  initialState: JSON.parse(localStorage.getItem("selectedBlog")) || {},
  reducers: {
    addSelectedBlog(state, action) {
      localStorage.setItem("selectedBlog", JSON.stringify(action.payload));
      return action.payload; //same as writting state.name = action.payload.name
    },

    removeSelectedBlog(state, action) {
      localStorage.removeItem("selectedBlog");
      return {};
    },

    changeLikes(state, action) {
      if (state.likes.includes(action.payload)) {
        state.likes = state.likes.filter((like) => action.payload != like);
      } else state.likes = [...state.likes, action.payload];
    },

    setCommentAction(state, action) {
      state.comments = [...state.comments, action.payload];
    },

    setCommentLikes(state, action) {
      /*
       * WHY CHANGING `comment.likes` AUTOMATICALLY UPDATES `state`:
       * 1. Pass by Reference: `.find()` does not create a copy. `comment` holds a direct
       *    reference (pointer) to the actual object inside `state.comments`.
       * 2. Immer (Redux Toolkit): RTK wraps `state` in an Immer draft proxy. When we mutate
       *    `comment.likes`, Immer detects the change inside `state.comments` and automatically
       *    produces a new immutable state so React re-renders.
       * 3. Rule: Mutating a property (`comment.likes = ...`) updates `state`, but reassigning
       *    the variable (`comment = ...`) will NOT update `state`.
       */

      const { commentId, userId } = action.payload;

      // let comment = state.comments.find((it) => it._id == commentId);

      // if (comment.likes.includes(userId)) {
      //   comment.likes = comment.likes.filter((like) => like != userId);
      // } else {
      //   comment.likes = [...comment.likes, userId];
      // }

      function toogleLike(comments) {
        return comments.map((comment) => {
          if (comment._id == commentId) {
            if (comment.likes.includes(userId)) {
              comment.likes = comment.likes.filter((like) => like != userId);
              return comment;
            } else {
              comment.likes = [...comment.likes, userId];
              return comment;
            }
          }

          if(comment.replies && comment.replies.length > 0) {
            return {...comment, replies : toogleLike(comment.replies)}
          }

          return comment;
        });
      }

      state.comments = toogleLike(state.comments);
    },

    setReplies(state, action) {
      // console.log(action.payload);

      let newReply = action.payload;

      function findParentComment(comments) {
        let parentComment;

        for (const comment of comments) {
          if (comment._id == newReply.parentComment) {
            parentComment = {
              ...comment,
              replies: [...comment.replies, newReply],
            };
            break;
          }

          if (comment.replies.length > 0) {
            parentComment = findParentComment(comment.replies);
            if (parentComment) {
              parentComment = {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply._id == parentComment._id ? parentComment : reply,
                ),
              };
              break;
            }
          }
        }

        return parentComment;
      }

      let parentComment = findParentComment(state.comments);
      console.log(parentComment);

      state.comments = state.comments.map((comment) =>
        comment._id == parentComment._id ? parentComment : comment,
      );
    },

    setUpdatedComments(state, action) {
      function updateComment(comments) {
        return comments?.map((comment) =>
          comment._id == action.payload._id
            ? { ...comment, comment: action.payload.comment }
            : comment.replies && comment.replies.length > 0
              ? { ...comment, replies: updateComment(comment.replies) }
              : comment,
        );
      }

      state.comments = updateComment(state.comments);
    },

    deleteCommentAndReply(state, action) {
      function deleteComment(comments) {
        if (!comments) return [];

        let filteredComments = comments.filter(
          (comment) => comment._id !== action.payload,
        );

        return filteredComments.map((comment) => {
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: deleteComment(comment.replies) };
          }
          return comment;
        });
      }

      state.comments = deleteComment(state.comments);
    },
  },
});

export const {
  addSelectedBlog,
  removeSelectedBlog,
  changeLikes,
  setCommentAction,
  setCommentLikes,
  setReplies,
  setUpdatedComments,
  deleteCommentAndReply,
} = selectedBlogSlice.actions;
export default selectedBlogSlice.reducer;
