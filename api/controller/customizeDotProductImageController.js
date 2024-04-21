const customizeDotProductImageSchema = require("../modal/customizeDotProductImageModal");
const customizeDotProductSchema = require("../modal/customizeDotProductModal");

const upload = require("../utils/imageUploader");
const { handleError } = require("../utils/handleError");

const fs = require("fs");
const { ObjectId } = require("mongodb");

/** create Customize dot product Image  */
const createCustomizeDotProductImage = async (req, res, next) => {
  try {
    const { dots, dotProductId, video } = req.body;
    const dotProductImage = new customizeDotProductImageSchema({
      ...(req.file && { image: req.file.filename }),
      dots: JSON.parse(dots),
      dotProductId: dotProductId,
      createdBy: req.user.id,
      video: video,
      updatedBy: req.user.id,
    });

    const dotProductImageData = await dotProductImage.save();
    /** remove Customize dot product image from the dotProductImageIds in  dotproductmodel  */
    if (dotProductImageData?.dotProductId) {
      const updateDotProductImageArr =
        await customizeDotProductSchema.findByIdAndUpdate(
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

/** get all Customize dot product Images  */
const getAllCustomizeDotProductImages = async (req, res, next) => {
  console.log("get all dot product Images");
  try {
    const { limit, page } = req.query;
    const limits = parseInt(limit) || 10000;
    const pageNo = parseInt(page) || 1;

    const dotProductImageData = await customizeDotProductImageSchema
      .find()
      .skip((pageNo - 1) * limits)
      .limit(limits)
      .populate("dotProductId");

    const totalCount = await customizeDotProductImageSchema.countDocuments({});
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

/** get Customize dot product Image by dot product id  */
const customizeDotProductImagesByProductId = async (req, res, next) => {
  try {
    const dotProductImageData = await customizeDotProductImageSchema
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
/** get Customize dot product Image by _id  */
const customizeDotProductImagesById = async (req, res, next) => {
  try {
    const dotProductImageData = await customizeDotProductImageSchema
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

/** update Customize dot product Image by _id */
const updateCustomizeDotProductImage = async (req, res, next) => {
  try {
    const { video } = req.body;
    const dots = JSON.parse(req.body.dots);
    let updateData = {};
    if (dots.length > 0) {
      updateData.dots = dots;
    } else {
      updateData.video = video;
    }
    await customizeDotProductImageSchema.updateOne(
      { _id: req.params.id },
      updateData
    );

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

/** delete Customize dot product by _id */
const deleteCustomizeDotProductImageById = async (req, res, next) => {
  try {
    const dotProductImage =
      await customizeDotProductImageSchema.findByIdAndDelete(req.params.id);

    if (dotProductImage?.image) {
      const imgpath = `images/dotimage/${dotProductImage.image}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }
    /** remove Customize dot product image from the dotProductImageIds in  dotproductmodel  */
    if (dotProductImage?.dotProductId) {
      const deleteDotProductImageId =
        await customizeDotProductSchema.findByIdAndUpdate(
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
  createCustomizeDotProductImage,
  getAllCustomizeDotProductImages,
  customizeDotProductImagesById,
  updateCustomizeDotProductImage,
  deleteCustomizeDotProductImageById,
  customizeDotProductImagesByProductId,
};
