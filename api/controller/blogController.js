const blogSchema = require("../modal/blogModal");

const fs = require('fs');

const getblog = async(req,res,next)=>{
    try {
        const blog = await blogSchema.find();
        res.status(200).json({
            success:true,
            blog,
            message:"Blogs Fetched Successfully"
        })
        
    } catch (error) {
        next(error)        
    }

}

const postblog = async(req,res,next)=>{
    try {
        const post = await blogSchema.create(req.body);
        
        res.status(200).json({success:true,message:"Blog post Added Successfully"})
        
    } catch (error) {
        next(error)
        
    }

}

const putblog = async(req,res,next)=>{
    try {
        const blog = await blogSchema.findByIdAndUpdate(req.params.id,{
            $set:req.body
        },{new:true});
        res.status(200).json({success:true,message:"Blog Updated Successfully"})
    } catch (error) {
        next(error)
        
    }

}

const deleteblog = async(req,res,next)=>{
    try {

        const blog = await blogSchema.findByIdAndDelete(req.params.id);
        res.status(200).json({success:true,message:"Blog Deleted Successfully"})
        
    } catch (error) {
        next(error)
        
    }

}

const blogdetails = async(req,res,next)=>{
    try {
        const blogdetails = await blogSchema.findById(req.params.id);
        res.status(200).json({success:true,blogdetails})
    } catch (error) {
        next(error)
        
    }

}


const BlogFindByUrl = async(req,res,next) =>{
    try {
        const blog = await blogSchema.findOne({"url":req.params.url});
        res.status(200).json({success:true,blog})
    } catch (error) {
        next(error)
    }
} 




const addImage = async (req, res, next) => {
    try {
        await blogSchema.findByIdAndUpdate(req.params.id, {
            $set: { FeaturedImage: req.file.filename },
        });
        res.status(200).json("Image Added Successfully")

    } catch (error) {
        next(error);
    }
}



const removeImage = async (req, res, next) => {
    try {
        await blogSchema.findByIdAndUpdate(req.params.id, {
            $unset: { FeaturedImage: "" },
        });
        //Image delete fromthe Server
        const deleteimgpath = `images/Blog/${req.params.name}`
        fs.unlinkSync(deleteimgpath)

        res.status(200).json("Image Removed Successfully")

    } catch (error) {
        next(error)
    }
}




module.exports = {getblog,postblog,putblog,deleteblog,blogdetails,BlogFindByUrl,addImage,removeImage}