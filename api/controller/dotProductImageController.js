const dotProductImageSchema = require("../modal/dotProductImageModal");
const dotProductSchema = require("../modal/dotProductModalNew");
const upload = require("../utils/imageUploader");
const { handleError } = require("../utils/handleError");

const fs = require("fs");
const { ObjectId } = require("mongodb");

/** create dot product Image  */
const createDotProductImage = async (req, res, next) => {
  try {
    const { dots, dotProductId, video } = req.body;
    const dotProductImage = new dotProductImageSchema({
      ...(req.file && { image: req.file.filename }),
      dots: JSON.parse(dots),
      dotProductId: dotProductId,
      video: video,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const dotProductImageData = await dotProductImage.save();
    /** remove dot product image from the dotProductImageIds in  dotproductmodel  */
    if (dotProductImageData?.dotProductId) {
      const updateDotProductImageArr = await dotProductSchema.findByIdAndUpdate(
        dotProductImageData.dotProductId,
        { $push: { dotProductImageIds: dotProductImageData._id } },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      data: dotProductImageData,
      message: "Dot Product Image Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get all dot product Images  */
const getAllDotProductImages = async (req, res, next) => {
  console.log("get all dot product Images");
  try {
    const { limit, page } = req.query;
    const limits = parseInt(limit) || 10000;
    const pageNo = parseInt(page) || 1;

    const dotProductImageData = await dotProductImageSchema
      .find({})
      .skip((pageNo - 1) * limits)
      .limit(limits)
      .populate("dotProductId");

    const totalCount = await dotProductImageSchema.countDocuments({});
    res.status(200).json({
      success: true,
      data: dotProductImageData,
      totalCount: totalCount,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get dot product Image by dot product id  */
const dotProductImagesByProductId = async (req, res, next) => {
  try {
    const dotProductImageData = await dotProductImageSchema
      .find({
        dotProductId: req.params.id,
      })
      .populate("dotProductId");

    res.status(200).json({
      success: true,
      data: dotProductImageData,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
/** get dot product Image by _id  */
const dotProductImagesById = async (req, res, next) => {
  try {
    const dotProductImageData = await dotProductImageSchema
      .findById(req.params.id)
      .populate([
        { path: "dotProductId" },
        { path: "dots.productId", select: "ProductName" },
      ]);

    res.status(200).json({
      success: true,
      data: dotProductImageData,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** update dot product Image by _id */
const updateDotProductImage = async (req, res, next) => {
  try {
    const { video } = req.body;
    const dots = JSON.parse(req.body.dots);
    let updateData = {};
    if (dots.length > 0) {
      updateData.dots = dots;
    } else {
      updateData.video = video;
    }
    await dotProductImageSchema.updateOne({ _id: req.params.id }, updateData);

    res.status(200).json({
      success: true,
      data: "dotProductImage",
      message: "Data Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error.message));
  }
};

/** delete dot product by _id */
const deleteDotProductImageById = async (req, res, next) => {
  console.log("delete dot product", req.params.id, req.params.pid);
  try {
    const dotProductImage = await dotProductImageSchema.findByIdAndDelete(
      req.params.id
    );

    if (dotProductImage?.image) {
      const imgpath = `images/dotimage/${dotProductImage.image}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }
    /** remove dot product image from the dotProductImageIds in  dotproductmodel  */
    if (dotProductImage?.dotProductId) {
      const deleteDotProductImageId = await dotProductSchema.findByIdAndUpdate(
        dotProductImage.dotProductId,
        { $pull: { dotProductImageIds: dotProductImage._id } },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Dot Product Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  createDotProductImage,
  getAllDotProductImages,
  dotProductImagesById,
  updateDotProductImage,
  deleteDotProductImageById,
  dotProductImagesByProductId,
};
