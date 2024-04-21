const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema({
    ImageName:{
        type:String
    },
    SideImage:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

module.exports = mongoose.model("Slider",sliderSchema)