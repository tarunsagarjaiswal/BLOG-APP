import { createSlice } from "@reduxjs/toolkit";

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

      let comment = state.comments.find((it) => it._id == commentId);

      if (comment.likes.includes(userId)) {
        comment.likes = comment.likes.filter((like) => like != userId);
      } else {
        comment.likes = [...comment.likes, userId];
      }
    },
  },
});

export const {
  addSelectedBlog,
  removeSelectedBlog,
  changeLikes,
  setCommentAction,
  setCommentLikes,
} = selectedBlogSlice.actions;
export default selectedBlogSlice.reducer;
