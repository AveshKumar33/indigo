const dotProductSchema = require("../modal/dotProductModalNew");
const { handleError } = require("../utils/handleError");
const dotProductImageSchema = require("../modal/dotProductImageModal");
const collectionTagModalSchema = require("../modal/collectionTagModal");
const TagsModalSchema = require("../modal/tagsmodal");

const fs = require("fs");
const { ObjectId } = require("mongodb");

/** create dot product  */
const createDotProduct = async (req, res, next) => {
  try {
    const { name, productTags, Tags, ...rest } = req.body;

    const dotData = new dotProductSchema({
      name,
      productTags: JSON.parse(productTags),
      Tags: JSON.parse(Tags),
      ...rest,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    /** apply validation same name dot product*/

    const dotProduct = await dotData.save();

    res.status(201).json({
      success: true,
      data: dotProduct,
      message: "Dot Product Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get all dot products  */
const getAllDotProduct = async (req, res, next) => {
  try {
    const { search, limit, page } = req.query;
    const searchTerm = search || "";
    const limits = parseInt(limit) || 10000;
    const pageNo = parseInt(page) || 1;

    let query = {};
    if (searchTerm !== "") {
      query.name = { $regex: searchTerm, $options: "i" };
    }
    const dotProduct = await dotProductSchema
      .find(query)
      .populate("dotProductImageIds")
      .sort({ displaySequence: 1 })
      .skip((pageNo - 1) * limits)
      .limit(limits);

    const totalCount = await dotProductSchema.countDocuments(query);
    res.status(200).json({
      success: true,
      data: dotProduct,
      totalCount: totalCount,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get all dot products  */
const getDotProducts = async (req, res, next) => {
  try {
    const dotProduct = await dotProductSchema.aggregate([
      {
        $match: {
          $expr: {
            $gt: [{ $size: "$dotProductImageIds" }, 0],
          },
        },
      },
    ]);

    const result = await dotProductSchema.populate(dotProduct, [
      {
        path: "dotProductImageIds",
        populate: {
          path: "dots.productId",
          select: "ProductName Urlhandle Collection",
          populate: {
            path: "Collection",
            select: "title url",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error.message));
  }
};

/** get dot product by _id  */
const dotProductsGetById = async (req, res, next) => {
  try {
    const dotProduct = await dotProductSchema.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: collectionTagModalSchema.collection.name,
          localField: "Tags",
          foreignField: "_id",
          as: "populatedTag",
        },
      },
      {
        $lookup: {
          from: TagsModalSchema.collection.name,
          localField: "productTags",
          foreignField: "_id",
          as: "productTags",
        },
      },
      {
        $unwind: "$populatedTag",
      },
      {
        $group: {
          _id: "$populatedTag.collectionFilterId",
          name: { $first: "$name" },
          Title: { $first: "$Title" },
          productTags: { $first: "$productTags" },
          displaySequence: { $first: "$displaySequence" },
          TitleSeo: { $first: "$TitleSeo" },
          Description: { $first: "$Description" },
          DescriptionSeo: { $first: "$DescriptionSeo" },
          status: { $first: "$status" },
          video: { $first: "$video" },
          data: {
            $push: {
              _id: "$populatedTag.collectionFilterId",
              collectionFilterTags: "$populatedTag",
            },
          },
        },
      },
    ]);

    // const result = await dotProductSchema.populate(dotProduct, [
    //   {
    //     path: "Tags",
    //   },
    //   {
    //     path: "dotProductImageIds",
    //     populate: {
    //       path: "dots.productId",
    //       populate: {
    //         path: "Collection",
    //         select: "title url",
    //       },
    //     },
    //   },
    // ]);

    res.status(200).json({
      success: true,
      data: dotProduct,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get dot product by _id  */
const dotProductsGetByIdForClient = async (req, res, next) => {
  try {
    const dotProduct = await dotProductSchema.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.id),
        },
      },
    ]);

    const result = await dotProductSchema.populate(dotProduct, [
      {
        path: "dotProductImageIds",
        populate: {
          path: "dots.productId",
          populate: {
            path: "Collection",
            select: "title url",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** update dot product by _id */
const updateDotProduct = async (req, res, next) => {
  try {
    const { name, Tags = {}, productTags, video, ...rest } = req.body;
    const dotData = {
      name,
      productTags: JSON.parse(productTags),
      Tags: JSON.parse(Tags),
      video: video[0],
      updatedBy: req.user.id,
      ...rest,
    };

    const dotProduct = await dotProductSchema.findByIdAndUpdate(req.params.id, {
      $set: dotData,
    });

    res.status(200).json({
      success: true,
      data: dotProduct,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** delete dot product by _id */
const deleteDotProductById = async (req, res, next) => {
  try {
    const dotProduct = await dotProductSchema.findByIdAndDelete(req.params.id);
    let deleteDotProductImages;
    let deleteCount;

    deleteDotProductImages = await dotProductImageSchema
      .find({
        dotProductId: dotProduct._id,
      })
      .exec();
    /** remove all dot product image related to  dotproductmodel  */
    if (dotProduct?._id) {
      deleteCount = await dotProductImageSchema.deleteMany({
        dotProductId: dotProduct._id,
      });
    }
    if (deleteCount.deletedCount === deleteDotProductImages.length) {
      for (const dotProductImage of deleteDotProductImages) {
        if (dotProductImage?.image) {
          const imgpath = `images/dotimage/${dotProductImage.image}`;
          if (fs.existsSync(imgpath)) {
            fs.unlinkSync(imgpath);
          }
        }
      }
    }
    res.status(200).json({
      success: true,
      message: "Dot Product Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** add image on product */
const addImages = async (req, res, next) => {
  try {
    const { dots } = req.body;

    let fileName = "";

    if (req.file) {
      fileName = req.file.filename;
    }

    const data = await dotProductSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          images: {
            ProductImage: fileName,
            dots: JSON.parse(dots),
          },
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "New image added Successfully",
      data,
    });
  } catch (error) {
    console.error(error, "check dot error");
    next(handleError(500, error.message));
  }
};

/** delete image  form product */
const deleteImage = async (req, res, next) => {
  const { fileName } = req.body;
  try {
    await dotProductSchema.updateOne(
      { _id: req.params.id },
      { $pull: { images: { _id: req.params.imageId } } },
      {
        new: true,
      }
    );

    if (fileName) {
      const imgpath = `images/dotimage/${fileName}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }
    res.status(200).json({
      success: true,
      message: "Delete  image Successfully",
    });
  } catch (error) {
    console.log(error, "error deleting");
  }
};

module.exports = {
  createDotProduct,
  getAllDotProduct,
  dotProductsGetById,
  updateDotProduct,
  deleteDotProductById,
  addImages,
  deleteImage,
  getDotProducts,
  dotProductsGetByIdForClient,
};
