const singleProductSchema = require("../modal/singleProductModal");
const dotProductImageSchema = require("../modal/dotProductImageModal");
const ProductDescriptionSchema = require("../modal/ProductDescriptionsmodal");
const SingleProductCombinationSchema = require("../modal/singleProductCombinationModal");
const collectionSchema = require("../modal/collection");

const {
  createCombination,
  compareArraysOfObjectsAndStrings,
} = require("../shared/singleProductCombination");
const parameterSchema = require("../modal/parameterModal");
const dotProductSchema = require("../modal/dotProductModalNew");
const singleProductCombinationSchema = require("../modal/singleProductCombinationModal");
const { handleError } = require("../utils/handleError");
const attributeSchema = require("../modal/attributeModalNew");
const { ObjectId } = require("mongodb");
const fs = require("fs");

/** create new product  */
const createProduct = async (req, res, next) => {
  try {
    let imgdata = [];

    if (req.files) {
      req?.files?.map((m) => imgdata.push(m.filename));
    }
    let {
      tags,
      Installment,
      attribute,
      ProductImage,
      Collection,
      CollectionChild,
      ...rest
    } = req.body;

    let productdata = {
      ProductImage: imgdata,
      tags: JSON.parse(tags),
      Installment: JSON.parse(Installment),
      attribute: JSON.parse(attribute),
      Collection: JSON.parse(Collection),
      ...rest,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    };
    let product = new singleProductSchema(productdata);
    /**  product is saving  here */
    let saveProduct = await product.save();
    /* create combinations logic call here */
    createCombination(saveProduct.attribute, saveProduct._id, req.user.id);
    res.status(201).json({
      success: true,
      message: "New Product created successfully",
      data: saveProduct,
      // matchedDocuments: AllCombination,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(handleError(500, "Same Product Url Already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

/** update single product  by _id */
const updateProductById = async (req, res, next) => {
  try {
    let imgdata = [];
    if (req.files || req.file) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    let {
      tags,
      Installment,
      attribute,
      ProductImage,
      Collection,
      CollectionChild,
      ...rest
    } = req.body;

    let productdata = {
      tags: JSON.parse(tags),
      Installment: JSON.parse(Installment),
      attribute: JSON.parse(attribute),
      // CollectionChild: JSON.parse(CollectionChild),
      Collection: JSON.parse(Collection),

      ...rest,
      updatedBy: req.user.id,
    };

    const updateOperation = {};
    if (imgdata?.length !== 0) {
      updateOperation.$push = { ProductImage: imgdata };
      updateOperation.$set = productdata;
    } else {
      updateOperation.$set = productdata;
    }

    const beforeUpdateProduct = await singleProductSchema.aggregate([
      {
        $match: { _id: new ObjectId(req.params.id) },
      },
    ]);

    try {
      const product = await singleProductSchema.findByIdAndUpdate(
        req.params.id,
        updateOperation,
        { new: true }
      );
      // .populate("attribute");

      const prevAttribute = beforeUpdateProduct[0].attribute;
      const updatedAttribute = product.attribute;

      /* delete all product combinations */

      const isNew = compareArraysOfObjectsAndStrings(
        prevAttribute,
        updatedAttribute
      );

      if (isNew) {
        await singleProductCombinationSchema.deleteMany({
          singleProductId: product._id,
        });

        /* create combinations logic call here */
        createCombination(product.attribute, product._id, req.user.id);
      }

      res.status(200).json({
        success: true,
        message: " Product Data updated Fetched",
        data: product,
      });
    } catch (error) {
      if (error.code === 11000) {
        return next(handleError(500, "Same Product Url Already Present"));
      } else {
        next(handleError(500, error.message));
      }
    }
  } catch (error) {
    console.log(error, "check this error");
  }
};

// fetch product by urlHandler

const fetchProductByUrlhandle = async (req, res) => {
  try {
    const product = await singleProductSchema
      .findOne({ Urlhandle: req.params.url ? req.params.url : {} })
      .populate("tags")
      .populate({
        path: "Collection",
        select: {
          title: 1,
          url: 1,
        },
      });

    const aggQuery = [
      {
        $match: { attributeId: { $in: product.attribute } },
      },
      {
        $lookup: {
          from: attributeSchema.collection.name,
          localField: "attributeId",
          foreignField: "_id",
          as: "attributeData",
        },
      },
      {
        $unwind: "$attributeData",
      },
      {
        $group: {
          _id: "$attributeId",
          attributeName: { $first: "$attributeData.Name" },
          attributePrintName: { $first: "$attributeData.PrintName" },
          parameter: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          attributeId: "$_id",
          attributeName: 1,
          attributePrintName: 1,
          parameter: 1,
        },
      },
    ];

    const productCombinations = await singleProductCombinationSchema.aggregate([
      {
        $match: {
          singleProductId: new ObjectId(product._id),
          SalePrice: { $gt: 0 },
          isDefault: true,
        },
      },
    ]);

    const result = await singleProductCombinationSchema.populate(
      productCombinations,
      [
        {
          path: "combinations.parameterId",
          select: "name profileImage",
        },
        {
          path: "combinations.attributeId",
          select: "Name PrintName",
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
      message: "All Product Data Fetched",
      data: product,
      productCombinations: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// fetch product by tag

const findProductByTags = async (req, res, next) => {
  try {
    let products = await singleProductSchema.find({
      tags: { $in: req.body.tags },
    });
    const prorductIds = products.map((product) => new ObjectId(product?._id));

    const productCombinations = await singleProductCombinationSchema.aggregate([
      {
        $match: {
          singleProductId: { $in: prorductIds },
          SalePrice: { $gt: 0 },
          isDefault: true,
        },
      },
    ]);

    const result = await singleProductCombinationSchema.populate(
      productCombinations,
      [
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
      data: result,
      message: "Product Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** get all products  */
const getAllproduct = async (req, res, next) => {
  try {
    const { search, limit, page, category } = req.query;
    let collIds = [];
    let collectionIds;
    if (category !== "" && category !== undefined) {
      collIds = category.split(",").map((id) => new ObjectId(id));
      const collections = await collectionSchema
        .find({
          rootPath: { $in: collIds },
        })
        .select("_id");
      collectionIds = collections.map((id) => id._id);
      collectionIds = [...collectionIds, ...collIds];
    }
    const searchTerm = search || "";
    const limits = parseInt(limit) || 10000;
    const pageNo = parseInt(page) || 1;
    let query = {};
    if (collectionIds !== undefined && collectionIds.length > 0) {
      query.Collection = { $in: collectionIds };
    }
    if (searchTerm !== "") {
      query.ProductName = { $regex: searchTerm, $options: "i" };
    }
    const getProducts = await singleProductSchema.aggregate([
      {
        $match: query,
      },
      {
        $sort: { displaySequence: 1 },
      },
      {
        $skip: (pageNo - 1) * limits,
      },
      {
        $limit: limits,
      },
    ]);

    const resData = await singleProductSchema.populate(getProducts, [
      { path: "attribute", select: "Name" },
      { path: "tags", select: "name" },
      { path: "Collection" },
    ]);
    const totalCount = await singleProductSchema.countDocuments(query);

    res.status(200).json({
      success: true,
      totalCount: totalCount,
      message: "All Product Data Fetched",
      data: resData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProducts = async (req, res, next) => {
  try {
    const getProducts = await singleProductSchema
      .find()
      .select("ProductName ProductStatus");

    res.status(200).json({
      success: true,
      data: getProducts,
      message: "All Product Data Fetched",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**get all wishlist  single products by id   */
const getWishlistProducts = async (req, res, next) => {
  try {
    const { filter } = req.query;
    const prodId = JSON.parse(filter);
    let productIds = [];
    if (prodId && prodId?.length > 0) {
      productIds = prodId.map((id) => new ObjectId(id));
    }
    const productCombination = await SingleProductCombinationSchema.aggregate([
      {
        $match: {
          singleProductId: { $in: productIds },
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
          populate: [
            { path: "Collection", select: "url" },
            { path: "attribute" },
          ],
        },
      ]
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "All Product Data Fetched",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**get all  single feature products   */
const getAllFeatureProducts = async (req, res, next) => {
  try {
    let productIds;
    productIds = await singleProductSchema
      .find({
        $and: [{ FeaturedProduct: true }, { ProductStatus: "Active" }],
      })
      .sort({ displaySequence: 1 })
      .select("_id ");

    if (productIds && productIds.length > 0) {
      productIds = productIds.map((id) => id._id);
    }

    const productCombination = await SingleProductCombinationSchema.aggregate([
      {
        $match: {
          singleProductId: { $in: productIds },
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
          populate: [
            { path: "Collection", select: "url" },
            { path: "attribute" },
          ],
        },
      ]
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "All Product Data Fetched",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** get single product by _id   */
const getproductById = async (req, res, next) => {
  try {
    const getProductById = await singleProductSchema.aggregate([
      {
        $match: { _id: new ObjectId(req.params.id) },
      },
    ]);

    const resData = await singleProductSchema.populate(getProductById, [
      { path: "attribute", select: "Name" },
      { path: "tags", select: "name" },
      { path: "Collection" },
    ]);

    res.status(200).json({
      success: true,
      message: "Get Product Data  by id Fetched",
      data: resData[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** get all Customize dot products by producty id */
const getAllCustomizeDotProductByProductId = async (req, res, next) => {
  try {
    const products = await dotProductImageSchema.aggregate([
      {
        $match: {
          dots: { $elemMatch: { productId: new ObjectId(req.params.pId) } },
        },
      },
      {
        $lookup: {
          from: dotProductSchema.collection.name,
          localField: "dotProductId",
          foreignField: "_id",
          as: "dotProduct",
        },
      },
      {
        $lookup: {
          from: singleProductSchema.collection.name,
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

    // const dotProduct = await dotProductImageSchema
    //   .find({
    //     dots: { $elemMatch: { productId: req.params.pId } },
    //   })
    //   .populate({
    //     path: "dotProductId",
    //     select: "-updatedAt -updatedBy -createdBy -createdAt",
    //     populate: {
    //       path: "dotProductImageIds",
    //       populate: {
    //         path: "dots.productId",
    //         populate: {
    //           path: "Collection",
    //         },
    //       },
    //     },
    //   });

    // .populate("dotProductId");
    res.status(200).json({
      success: true,
      data: products,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** delete single product by id   */
const deleteProductById = async (req, res, next) => {
  try {
    let product;
    /** if single product is exist inside dot product then cann't delete the single product */
    const existProduct = await dotProductImageSchema.find({
      "dots.productId": req.params.id,
    });

    /** if product is not exist inside dot product */
    if (existProduct?.length === 0) {
      product = await singleProductSchema.findByIdAndDelete(req.params.id);
      /**  delete all combinations of corresponding product id   */
      if (product?._id) {
        await singleProductCombinationSchema.deleteMany(product?._id);
      }
      /**  delete all descriptions of corresponding product   */
      if (product?._id) {
        const productId = (product?._id).toString();
        await ProductDescriptionSchema.deleteMany({
          Product: productId,
        });
      }
      res.status(200).json({
        success: true,
        message: " Product has deleted successfully",
        data: product,
      });
      return;
    }

    res.status(409).json({
      success: false,
      message: "Product is in use ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** remove image  by _id  */

const removeImage = async (req, res) => {
  try {
    await singleProductSchema
      .findByIdAndUpdate(req.params.id, {
        $pull: { ProductImage: req.params.name },
      })
      .populate("attribute");

    //  Image delete from the Server
    const deleteimgpath = `images/product/${req.params.name}`;
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

module.exports = {
  createProduct,
  getAllproduct,
  getproductById,
  deleteProductById,
  updateProductById,
  removeImage,
  fetchProductByUrlhandle,
  findProductByTags,
  getProducts,
  getWishlistProducts,
  getAllFeatureProducts,
  getAllCustomizeDotProductByProductId,
};
