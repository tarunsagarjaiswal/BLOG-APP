import {configureStore} from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import selectedBlogSlice from "./selectedBlogSlice"
import commentSlice from "./commentSlice"

const store = configureStore({
    reducer : {
        user : userSlice,
        selectedBlogSlice : selectedBlogSlice,
        commentSlice : commentSlice,
    }
});

export default store;