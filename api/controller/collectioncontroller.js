const collectionSchema = require("../modal/collection");
const productSchema = require("../modal/productmodal");
const headerImageModalSchema = require("../modal/headerImageModal");
const customizedProductSchema = require("../modal/customizeProductModel");
const customizedProductCombinationSchema = require("../modal/customizeProductCombinationModal");

const singleProductSchema = require("../modal/singleProductModal");
const SingleProductCombinationSchema = require("../modal/singleProductCombinationModal");

const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { handleError } = require("../utils/handleError");

const fs = require("fs");

const getcollections = async (req, res, next) => {
  try {
    const collections = await collectionSchema
      .find(req.query ? req.query : {})
      .sort({ displaySequence: -1 })

      // .populate("productTags")
      .populate("rootPath", {
        title: 1,
      });

    res.status(200).json({
      success: true,
      data: collections,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const getMostSellingCollections = async (req, res, next) => {
  try {
    const collections = await collectionSchema.find({
      mostSellingProduct: 1,
      status: 1,
    });

    res.status(200).json({
      success: true,
      data: collections,
      message: "Most selling product fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getHeader = async (req, res, next) => {
  try {
    const collections = await collectionSchema
      .find({ isRoot: true }, "url title")
      .sort({ isRoot: -1 });

    const MyHade = await Promise.all(
      collections.map(async (ele, i) => {
        const Data = await collectionSchema.find(
          { rootPath: { $eq: [ele._id] } },
          "url title"
        );

        return {
          P: ele,
          Child: Data,
        };
      })
    );
    // { rootPath: { $eq: allChild } },

    res.status(200).json({
      success: true,
      data: MyHade,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getRootCollection = async (req, res, next) => {
  try {
    const collections = await collectionSchema
      .find(
        { isRoot: true }
        // {
        //   title: 1,
        //   isRoot: 1,
        //   rootPath: 1,
        // }
      )
      .select("-createdAt -updatedAt -createdBy -updatedBy")
      .populate("rootPath", {
        title: 1,
        isRoot: 1,
        rootPath: 1,
      });

    res.status(200).json({
      success: true,
      data: collections,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const getCollectionByName = async (req, res, next) => {
  try {
    const collection = await collectionSchema.find(
      {},
      { title: 1, rootPath: 1 }
    );

    const selectBoxData = collection.map((data) => {
      return {
        value: data._id,
        label: data.title,
        rootPath: data?.rootPath ?? [],
      };
    });

    res.status(200).json({
      success: true,
      data: selectBoxData,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const getChildCollection = async (req, res, next) => {
  const { allChild } = req.body;

  try {
    const collections = await collectionSchema
      .find(
        { rootPath: { $eq: allChild } },
        {
          title: 1,
          isRoot: 1,
          rootPath: 1,
        }
      )
      .populate("rootPath", {
        title: 1,
        isRoot: 1,
        rootPath: 1,
      });

    res.status(200).json({
      success: true,
      data: collections,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postcollections = async (req, res, next) => {
  try {
    let imgData = [];
    if (req.files) {
      req?.files?.map((m) => imgData.push(m.filename));
    }

    const { rootPath, ...rest } = req.body;
    const collections = await collectionSchema.create({
      rootPath: JSON.parse(rootPath),
      CollectionImage: imgData,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...rest,
      // childCollections: JSON.parse(childCollections),
    });

    await collectionSchema.findByIdAndUpdate(collections._id, {
      $set: { parentId: collections._id },
    });

    const headerImageData = new headerImageModalSchema({
      rootPath: JSON.parse(rootPath),
      isRoot: collections.isRoot,
      collectionId: collections._id,
      pngImage: "headerDefaultImage.jpg",
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    await headerImageData.save();

    res.status(200).json({
      success: true,
      message: "collections Created Successfully",
      data: collections,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const putcollections = async (req, res, next) => {
  try {
    let imgData = [];

    if (req.files) {
      req?.files?.map((m) => imgData.push(m.filename));
    }

    let CollectionData = {
      ...req.body,
      updatedBy: req.user.id,
      // childCollections: JSON.parse(childCollections),
    };

    const updateOperation = {};
    if (imgData?.length !== 0) {
      updateOperation.$push = { CollectionImage: imgData };
      updateOperation.$set = CollectionData;
    } else {
      updateOperation.$set = CollectionData;
    }

    const collections = await collectionSchema.findByIdAndUpdate(
      req.params.id,
      updateOperation,
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: collections,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const updateCollection = async (req, res) => {
  try {
    const { from, to } = req.body;

    let collection = await collectionSchema.findByIdAndUpdate(from, {
      $push: {
        rootPath: to, // root  main gate id push into swing gate
      },
    });

    return res.status(200).json({
      from,
      to,
    });
  } catch (error) {}
};

const getcollectiondetails = async (req, res, next) => {
  try {
    let collections = await collectionSchema.findById(req.params.id);
    /** if collection is exist inside single product */
    const collectionInSingleProduct = await singleProductSchema.aggregate([
      {
        $match: { Collection: new mongoose.Types.ObjectId(req.params.id) },
      },
      {
        $lookup: {
          from: SingleProductCombinationSchema.collection.name,
          localField: "_id",
          foreignField: "singleProductId",
          as: "relatedData",
        },
      },
      {
        $match: {
          "relatedData.isDefault": true,
        },
      },
    ]);
    /** if collection is exist inside customized product */
    const customizedProduct = await customizedProductSchema.aggregate([
      {
        $match: {
          ProductStatus: "Active",
          Collection: new mongoose.Types.ObjectId(req.params.id),
        },
      },
    ]);

    const customizedProductData = await customizedProductSchema.populate(
      customizedProduct,
      [{ path: "attribute" }]
    );

    const productId = customizedProductData.map(
      (product) => new mongoose.Types.ObjectId(product._id)
    );

    const productCombination =
      await customizedProductCombinationSchema.aggregate([
        {
          $match: {
            productId: { $in: productId },
          },
        },
      ]);

    const result = await customizedProductCombinationSchema.populate(
      productCombination,
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
          },
        },
      ]
    );

    const products = [...collectionInSingleProduct, ...result];
    res.status(200).json({
      success: true,
      data: collections,
      products: products,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
/** get all child collection by _id  */
const fetchChildCollectionsDetails = async (req, res, next) => {
  const { id } = req.params;
  try {
    let collections = await collectionSchema.find({
      rootPath: { $in: new mongoose.Types.ObjectId(id) },
    });
    res.status(200).json({
      success: true,
      data: collections,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deletecollections = async (req, res, next) => {
  try {
    /** if collection is exist inside single product */
    const collectionInSingleProduct = await singleProductSchema.find({
      Collection: req.params.id,
    });
    /** if collection is exist inside customized product */
    const collectionInCustomizeProduct = await customizedProductSchema.find({
      Collection: req.params.id,
    });
    // .select("ProductName tags");

    /**  validation of collection   */
    if (
      collectionInSingleProduct?.length > 0 ||
      collectionInCustomizeProduct?.length > 0
    ) {
      res.status(409).json({
        success: true,
        message: " Collection is used in product",
      });
      return;
    }

    await headerImageModalSchema.deleteOne({ collectionId: req.params.id });

    await collectionSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "collections Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const removeImage = async (req, res) => {
  try {
    await collectionSchema.findByIdAndUpdate(req.params.id, {
      $pull: { CollectionImage: req.params.name },
    });

    //  Image delete fromthe Server
    const deleteimgpath = `images/collection/${req.params.name}`;
    fs.unlinkSync(deleteimgpath, (err) => {
      if (err) {
        return res.status(200).json({
          success: true,
          message: "Image Deleted Successfully",
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Image Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const removeVideo = async (req, res) => {
  try {
    await collectionSchema.findByIdAndUpdate(req.params.id, {
      $pull: { CollectionVideo: req.params.name },
    });
    //  Image delete fromthe Server
    const deleteimgpath = `video/CollectionVideo/${req.params.name}`;
    fs.unlinkSync(deleteimgpath, (err) => {
      if (err) {
        return res.status(200).json({
          success: true,
          message: "Image Deleted Successfully",
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Image Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const uploadVideo = async (req, res) => {
  try {
    let imgdata = [];
    if (req.files || req.file) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    await collectionSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: { CollectionVideo: imgdata },
      },
      { new: true }
    );

    return res.status(500).json({
      success: true,
      // message: error.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**get data by url */
const getCollectionDataByUrl = async (req, res) => {
  try {
    const data = await collectionSchema
      .findOne({ url: req.params.url })
      .populate([{ path: "rootPath", select: "title url" }]);
    res.status(200).json({
      success: true,
      data: data,
      message: "data fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get matched Product with url
const getmatchedcollectionproduct = async (req, res, next) => {
  try {
    let collections;
    let collection;
    let collectionRootHeaderImage;
    let collectionRootChildHeaderImage;
    const rootCollection = await collectionSchema.findOne({
      $and: [{ isRoot: true }, { url: req.params.url }],
    });

    /***check if it is root collection */
    if (rootCollection) {
      collectionRootHeaderImage = await headerImageModalSchema
        .findOne({ collectionId: rootCollection._id })
        .select("pngImage");

      collections = await collectionSchema
        .find({
          rootPath: rootCollection._id,
        })
        .select("_id");
    }
    let collectionIds = [];
    if (collections?.length > 0) {
      collectionIds = collections.map((id) => id._id);
      collectionIds.push(rootCollection._id.toString());
    } else {
      collection = await collectionSchema
        .findOne({ url: req.params.url })
        // .populate("productTags")
        .populate("rootPath", {
          url: 1,
        });
      collectionIds.push(collection._id);

      collectionRootChildHeaderImage = await headerImageModalSchema
        .findOne({ collectionId: collection._id })
        .select("pngImage");
    }

    let products = await singleProductSchema
      .find({
        ProductStatus: "Active",
        // tags: { $in: filteredtags },
        // Collection: collection._id,
        Collection: { $in: collectionIds },
      })
      .populate("attribute");

    const productId = products.map(
      (product) => new mongoose.Types.ObjectId(product._id)
    );

    const productCombination = await SingleProductCombinationSchema.aggregate([
      {
        $match: {
          singleProductId: { $in: productId },
          isDefault: true,
          SalePrice: { $gt: 0 },
        },
      },
    ]);

    const result = await SingleProductCombinationSchema.populate(
      productCombination,
      [
        {
          path: "parameterIds",
          select: "name profileImage",
        },
        {
          path: "singleProductId",
          populate: {
            path: "attribute",
          },
        },
      ]
    );

    res.status(200).json({
      success: true,
      data: rootCollection
        ? {
            ...rootCollection,
            collectionHeaderImage: collectionRootHeaderImage,
          }
        : {
            ...collection,
            collectionHeaderImage: collectionRootChildHeaderImage,
          },
      products: products,
      productsCombinations: result,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "Product Not Fetched Successfully",
    });
  }
};

const getmatchedcollectionCustomizedproduct = async (req, res, next) => {
  try {
    let collections;
    let collection;
    const rootCollection = await collectionSchema.find({
      $and: [{ isRoot: true }, { url: req.params.url }],
    });

    // console.log("get rootCollection customize product", rootCollection);
    /** check if it is root collection */
    let collectionIds = [];
    if (rootCollection?.length > 0) {
      collections = await collectionSchema
        .find({
          rootPath: rootCollection[0]._id,
        })
        .select("_id");
      collectionIds = collections.map(
        (collection) => new mongoose.Types.ObjectId(collection?._id)
      );
      collectionIds.push(rootCollection[0]._id);
    } else {
      collection = await collectionSchema.aggregate([
        { $match: { url: req.params.url } },
      ]);
      collectionIds.push(collection[0]?._id);
    }
    // const collection = await collectionSchema
    //   .findOne({ url: req.params.url })
    //   // .populate("productTags")
    //   .populate("rootPath", {
    //     url: 1,
    //   });

    // let products = await singleProductSchema
    //   .find({
    //     ProductStatus: "Active",
    //     // tags: { $in: filteredtags },
    //     // Collection: collection._id,
    //     Collection: { $in: collectionIdArray },
    //   })
    //   .populate("attribute");

    // let collectionIds;
    // if (collections?.length > 0) {
    //   collectionIds = collections.map(
    //     (id) => new mongoose.Types.ObjectId(id._id)
    //   );
    // }

    // if (collectionIds.length > 0) {
    //   collectionIdArray = collectionIds;
    // } else {
    //   collectionIdArray = collection._id;
    // }
    const collectionData = await collectionSchema.populate(collection, [
      { path: "rootPath", select: "url" },
    ]);

    // const collectionId = collectionData[0]?._id;

    const customizedProduct = await customizedProductSchema.aggregate([
      {
        $match: {
          ProductStatus: "Active",
          Collection: { $in: collectionIds },
        },
      },
    ]);
    const customizedProductData = await customizedProductSchema.populate(
      customizedProduct,
      [{ path: "attribute" }]
    );

    const productId = customizedProductData.map(
      (product) => new mongoose.Types.ObjectId(product._id)
    );

    const productCombination =
      await customizedProductCombinationSchema.aggregate([
        {
          $match: {
            productId: { $in: productId },
          },
        },
        {
          $match: {
            $or: [
              {
                Front: {
                  $elemMatch: { parameterId: { $exists: true, $ne: null } },
                },
              },
              {
                Front: {
                  $elemMatch: { positionId: { $exists: true, $ne: null } },
                },
              },
              {
                CB: {
                  $elemMatch: { parameterId: { $exists: true, $ne: null } },
                },
              },
              {
                CB: {
                  $elemMatch: { positionId: { $exists: true, $ne: null } },
                },
              },
              {
                IB: {
                  $elemMatch: { parameterId: { $exists: true, $ne: null } },
                },
              },
              {
                IB: {
                  $elemMatch: { positionId: { $exists: true, $ne: null } },
                },
              },
              {
                SAF: {
                  $elemMatch: { parameterId: { $exists: true, $ne: null } },
                },
              },
              {
                SAF: {
                  $elemMatch: { positionId: { $exists: true, $ne: null } },
                },
              },
            ],
          },
        },
      ]);

    const result = await customizedProductCombinationSchema.populate(
      productCombination,
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
          populate: [
            { path: "Collection" },
            {
              path: "attribute",
              select: "Name PrintName UOMId",
              populate: [
                {
                  path: "UOMId",
                  select: "name",
                },
              ],
            },
          ],
        },
      ]
    );

    res.status(200).json({
      success: true,
      data: collectionData,
      customizeProductsCombinations: result,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product Not Fetched Successfully",
    });
  }
};

const navbarcollectiondata = async (req, res, next) => {
  try {
    const collections = await collectionSchema.find(
      req.query ? req.query : {},
      {
        description: false,
        title: false,
        _id: false,
        // productTags: false,
        seoTitle: false,
        seoMetaDescription: false,
        _id: false,
        __v: false,
        createdAt: false,
        updatedAt: false,
      }
    );
    // .populate("productTags");
    // .populate({
    //   path: "childCollections",
    //   select:
    //     "-_id -__v -createdAt -updatedAt -seoMetaDescription -seoTitle -description -title -productTags",
    //   populate: {
    //     path: "childCollections",
    //     select:
    //       "-_id -__v -createdAt -updatedAt -seoMetaDescription -seoTitle -description -title -productTags",
    //   },
    //   populate: {
    //     path: "childCollections",
    //     select:
    //       "-_id -__v -createdAt -updatedAt -seoMetaDescription -seoTitle -description -title -productTags",
    //     populate: {
    //       path: "childCollections",
    //       select:
    //         "-_id -__v -createdAt -updatedAt -seoMetaDescription -seoTitle -description -title -productTags",
    //     },
    //   },
    // });

    res.status(200).json({
      success: true,
      data: collections,
      message: "Data fetched Successfully",
    });
  } catch (error) {}
};

module.exports = {
  deletecollections,
  getcollectiondetails,
  putcollections,
  postcollections,
  getcollections,
  getmatchedcollectionproduct,
  removeImage,
  uploadVideo,
  removeVideo,
  updateCollection,
  getRootCollection,
  getChildCollection,
  getCollectionByName,
  getmatchedcollectionCustomizedproduct,
  getHeader,
  getCollectionDataByUrl,
  fetchChildCollectionsDetails,
  getMostSellingCollections,
};
