const customizeDotProductSchema = require("../modal/customizeDotProductModal");
const customizeProductSchema = require("../modal/customizeProductModel");
const dotProductSchema = require("../modal/dotProductModalNew");
const customizeProductCombinationSchema = require("../modal/customizeProductCombinationModal");
const { handleError } = require("../utils/handleError");
const customizeDotProductImageSchema = require("../modal/customizeDotProductImageModal");
const collectionTagModalSchema = require("../modal/collectionTagModal");
const TagsModalSchema = require("../modal/tagsmodal");
const fs = require("fs");
const { ObjectId } = require("mongodb");

/** create Customize Customize Dot Product */
const createCustomizeDotProduct = async (req, res, next) => {
  try {
    const { name, productTags, Tags, video, ...rest } = req.body;

    const dotdata = new customizeDotProductSchema({
      name,
      video: video[0],
      productTags: JSON.parse(productTags),
      Tags: JSON.parse(Tags),
      ...rest,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const dotProduct = await dotdata.save();

    res.status(201).json({
      success: true,
      data: dotProduct,
      message: "Product Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get all Customize dot products  */
const getAllCustomizeDotProduct = async (req, res, next) => {
  try {
    const { search, limit, page } = req.query;
    const searchTerm = search || "";
    const limits = parseInt(limit) || 10000;
    const pageNo = parseInt(page) || 1;

    let query = {};
    if (searchTerm !== "") {
      query.name = { $regex: searchTerm, $options: "i" };
    }
    const dotProduct = await customizeDotProductSchema
      .find(query)
      .sort({ displaySequence: 1 })
      .skip((pageNo - 1) * limits)
      .limit(limits);

    const totalCount = await customizeDotProductSchema.countDocuments(query);
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

/** get all Customize dot products by producty id */
const getAllCustomizeDotProductByProductId = async (req, res, next) => {
  try {
    const products = await customizeDotProductImageSchema.aggregate([
      {
        $match: {
          dots: { $elemMatch: { productId: new ObjectId(req.params.pId) } },
        },
      },
      {
        $lookup: {
          from: customizeDotProductSchema.collection.name,
          localField: "dotProductId",
          foreignField: "_id",
          as: "dotProduct",
        },
      },
      {
        $lookup: {
          from: customizeProductSchema.collection.name,
          localField: "dots.productId",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $addFields: {
          dots: {
            $map: {
              input: "$dots",
              as: "dot",
              in: {
                $mergeObjects: [
                  "$$dot",
                  {
                    productId: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$products",
                            as: "p",
                            cond: { $eq: ["$$p._id", "$$dot.productId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$dotProductId",
          dotProductId: { $first: { $arrayElemAt: ["$dotProduct", 0] } },
          image: { $first: "$image" },
          video: { $first: "$video" },
          dots: { $first: "$dots" },
        },
      },
      {
        $sort: {
          "dotProductId.displaySequence": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: products,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get  Customize all dot products  */
const getCustomizeDotProducts = async (req, res, next) => {
  try {
    const dotProduct = await customizeDotProductSchema.aggregate([
      {
        $match: {
          $expr: {
            $gt: [{ $size: "$dotProductImageIds" }, 0],
          },
        },
      },
    ]);

    const result = await customizeDotProductSchema.populate(dotProduct, [
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

/** get Customize dot product by _id  */
const custonizeDotProductsGetByIdForEdit = async (req, res, next) => {
  try {
    const dotProduct = await customizeDotProductSchema.aggregate([
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
          TitleSeo: { $first: "$TitleSeo" },
          productTags: { $first: "$productTags" },
          displaySequence: { $first: "$displaySequence" },
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

    res.status(200).json({
      success: true,
      data: dotProduct,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get Customize dot product by _id  */
const custonizeDotProductsGetById = async (req, res, next) => {
  try {
    const dotProduct = await customizeDotProductSchema.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.id),
        },
      },
    ]);

    const result = await customizeDotProductSchema.populate(dotProduct, [
      {
        path: "dotProductImageIds",
        populate: {
          path: "dots.productId",
          select: "Collection ProductName ProductImage Urlhandle",
          populate: {
            path: "Collection",
            select: "title url",
          },
        },
      },
    ]);

    const customizedDotProduct = result[0];

    const customizedProducts = customizedDotProduct?.dotProductImageIds.flatMap(
      (p) => p?.dots
    );

    const customizedProductId = customizedProducts.map((p) => p.productId._id);

    const customizedProductsCombinations =
      await customizeProductCombinationSchema.aggregate([
        {
          $match: {
            productId: { $in: customizedProductId },
          },
        },
      ]);

    const customizedProductsCombinationsData =
      await customizeProductCombinationSchema.populate(
        customizedProductsCombinations,
        [
          {
            path: "CB.parameterId",
            select: "name price",
            populate: {
              path: "attributeId",
              select: "Name UOMId",
              populate: {
                path: "UOMId",
                select: "name",
              },
            },
          },
          {
            path: "Front.parameterId",
            select: "name price",
            populate: {
              path: "attributeId",
              select: "Name UOMId",
              populate: {
                path: "UOMId",
                select: "name",
              },
            },
          },
          {
            path: "IB.parameterId",
            select: "name price",
            populate: {
              path: "attributeId",
              select: "Name UOMId",
              populate: {
                path: "UOMId",
                select: "name",
              },
            },
          },
          {
            path: "SAF.parameterId",
            select: "name price",
            populate: {
              path: "attributeId",
              select: "Name UOMId",
              populate: {
                path: "UOMId",
                select: "name",
              },
            },
          },
          {
            path: "productId",
            populate: {
              path: "Collection",
              select: "url",
            },
          },
        ]
      );

    res.status(200).json({
      success: true,
      data: result[0] || [],
      customizedProductsCombinations: customizedProductsCombinationsData,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** update Customize dot product by _id */
const updateCustomizeDotProduct = async (req, res, next) => {
  try {
    const { name, Tags = {}, productTags, video, ...rest } = req.body;
    const dotData = {
      name,
      video: video,
      productTags: JSON.parse(productTags),
      Tags: JSON.parse(Tags),
      ...rest,
      updatedBy: req.user.id,
    };

    const dotProduct = await customizeDotProductSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: dotData,
      }
    );

    res.status(200).json({
      success: true,
      data: dotProduct,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** delete Customize dot product by _id */
const deleteCustomizeDotProductById = async (req, res, next) => {
  try {
    const dotProduct = await customizeDotProductSchema.findByIdAndDelete(
      req.params.id
    );
    let deleteDotProductImages;
    let deleteCount;

    deleteDotProductImages = await customizeDotProductImageSchema
      .find({
        dotProductId: dotProduct._id,
      })
      .exec();
    /** remove all Customize dot product image related to  dotproductmodel  */
    if (dotProduct?._id) {
      deleteCount = await customizeDotProductImageSchema.deleteMany({
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

    const data = await customizeDotProductSchema.findByIdAndUpdate(
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
    await customizeDotProductSchema.updateOne(
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

const getWishlistProducts = async (req, res, next) => {
  try {
    const { filter } = req.query;
    const prodId = JSON.parse(filter);
    let productIds = [];
    if (prodId && prodId?.length > 0) {
      productIds = prodId.map((id) => new ObjectId(id));
    }
    // fetching single dot products
    const dotProductFilters = await dotProductSchema.aggregate([
      {
        $match: { _id: { $in: productIds } },
      },
      {
        $match: { status: 1 },
      },
      {
        $sort: { displaySequence: 1 },
      },
    ]);

    const resultSP = await dotProductSchema.populate(dotProductFilters, [
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
        select: "-createdAt -updatedAt -createdBy -updatedBy ",
      },
    ]);

    // fetching dot customized products
    // Perform the second query
    const customizeDotProductFilters =
      await customizeDotProductSchema.aggregate([
        {
          $match: { _id: { $in: productIds } },
        },
        {
          $match: { status: 1 },
        },
        {
          $sort: { displaySequence: 1 },
        },
      ]);
    const resultCP = await customizeDotProductSchema.populate(
      customizeDotProductFilters,
      [
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
          select: "-createdAt -updatedAt -createdBy -updatedBy ",
        },
      ]
    );
    // Merge the results
    const mergedFilters = [...resultSP, ...resultCP];
    //sort array of objects accourding to displaySequence
    mergedFilters.sort((a, b) => a.displaySequence - b.displaySequence);
    res.status(200).json({
      success: true,
      data: mergedFilters,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error.message));
  }
};

module.exports = {
  createCustomizeDotProduct,
  getAllCustomizeDotProduct,
  custonizeDotProductsGetById,
  updateCustomizeDotProduct,
  deleteCustomizeDotProductById,
  addImages,
  deleteImage,
  getAllCustomizeDotProductByProductId,
  getCustomizeDotProducts,
  custonizeDotProductsGetByIdForEdit,
  getWishlistProducts,
};
