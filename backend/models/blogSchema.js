const mooongose = require("mongoose");

const blogSchema = new mooongose.Schema({
    title : {
        type : String,
        required : true,    //mandatory field
        trim : true    //remove leading and trailing spaces
    },
    description : {
        type : String,
        required : true
    },
    content : {
        type : Object,
        required : true
    },
    draft : {
        type : Boolean,
        default : false,    //like we set the blog public defaulty 
    },
    creator : {
        type : mooongose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    blogId : {
        type : String,
        required : true,
        unique : true
    },
    image : {
        type : String,
        required : true
    },
    imageId : {
        type : String,
        required : true
    },
    likes : [
        {
            type : mooongose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    comments : [
        {
            type : mooongose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ]

}, {timestamps : true});    //timestamp will add two extra attributes like created at and updated at in your document inside blogs collection

const Blog = mooongose.model("Blog", blogSchema);

module.exports = Blog;
