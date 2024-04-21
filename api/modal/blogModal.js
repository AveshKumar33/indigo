const mongoose = require("mongoose");

const blogModal = new mongoose.Schema({
    heading:{
        type: String,
        required: [true,"Heading is Required"],
    },
    content:{
        type: String,
        required: [true,"Content is Required"],
    },
    description:{
        type:String,
        required: [true,"Description is required"],
    },
    keywords:{
        type:String,
        required: [true,"Keywords is required"],
    },
    author:{
        type:String,
        required: [true,"Author is required"],
    },
    url:{
        type:String,
        required: [true,"Url is required"],
        trim:true,
        unique:true,
    },
    FeaturedImage:{
        type:String,
        // required: [true,"Featured Image is required"],
    },
    BlogsImage:{
        type:[String]
    }

},{timestamps:true})

module.exports = mongoose.model("Blog",blogModal)