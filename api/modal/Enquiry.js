const mongoose = require("mongoose");


const enquiry = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Phone:{
        type:Number,
        required:true
    },
    Email:{
        type:String,
        trim: true,
        lowercase: true,
        validate:{
            validator:function(v){

                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        },
        required: [true, "Email required"]
    },
    message:{
        type:String
    }

},{timestamps:true});


module.exports = mongoose.model("Enquiry",enquiry)