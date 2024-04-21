const customizedProductSchema = require("../modal/customizeProductModel");
const customizeProductCombination = require("../modal/customizeProductCombinationModal");
const customizeDotProductImageSchema = require("../modal/customizeDotProductImageModal");
const customizeComboRectangleModalSchema = require("../modal/customizeComboRectangleModal");
const AttributeCategorySchema = require("../modal/AttributeCategoryModal");
const collectionSchema = require("../modal/collection");
const customizedProductCombinationSchema = require("../modal/customizeProductCombinationModal");
const positionSchema = require("../modal/positionModal");
const parameterSchema = require("../modal/parameterModal");
const { handleError } = require("../utils/handleError");
const attributeSchema = require("../modal/attributeModalNew");
const { ObjectId } = require("mongodb");
const fs = require("fs");

/** remove image  by _id  */

const removeImage = async (req, res) => {
  try {
    await customizedProductSchema.findByIdAndUpdate(req.params.id, {
      $pull: { ProductImage: req.params.name },
    });

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

/** create new customized  product  */
const createCustomizedProduct = async (req, res, next) => {
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
      // CollectionChild: JSON.parse(CollectionChild),
      ...rest,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    };
    let product = new customizedProductSchema(productdata);
    /**  product is saving  here */
    let saveProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "New Product created successfully",
      data: saveProduct,
    });
  } catch (error) {
    // console.log(error);
    if (error.code === 11000) {
      return next(handleError(500, "Same Product Url Already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

/** update customized product  by _id */
const updateCustomizedProductById = async (req, res, next) => {
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

    try {
      const existingProduct = await customizedProductSchema.aggregate([
        {
          $match: {
            _id: new ObjectId(req.params.id),
          },
        },
      ]);

      const product = await customizedProductSchema.findByIdAndUpdate(
        req.params.id,
        updateOperation
      );

      if (req.file) {
        const imgpath = `images/product/${product.ProductImage}`;
        if (fs.existsSync(imgpath)) {
          fs.unlinkSync(imgpath);
        }
      }

      const foundProductAttributes = existingProduct[0].attribute;
      const updatedProductAttribute = JSON.parse(attribute);

      for (const foundProductAttribute of foundProductAttributes) {
        const att = updatedProductAttribute.find(
          (arr) => arr === foundProductAttribute.toString()
        );

        if (!att) {
          await customizeProductCombination.updateOne(
            { productId: req.params.id },
            {
              $pull: {
                Front: { attributeId: foundProductAttribute },
                SAF: { attributeId: foundProductAttribute },
                CB: { attributeId: foundProductAttribute },
                IB: { attributeId: foundProductAttribute },
              },
            }
          );
        }
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
/**get all wishlist  single products by id   */
const getWishlistProducts = async (req, res, next) => {
  const { filter } = req.query;
  const prodId = JSON.parse(filter);
  let productIds = [];
  if (prodId && prodId?.length > 0) {
    productIds = prodId.map((id) => new ObjectId(id));
  }

  try {
    const productCombination =
      await customizedProductCombinationSchema.aggregate([
        {
          $match: {
            productId: { $in: productIds },
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
/**get all customized featured products by id   */
const getAllFeatureProducts = async (req, res, next) => {
  try {
    let productIds;
    productIds = await customizedProductSchema
      .find({
        $and: [{ FeaturedProduct: true }, { ProductStatus: "Active" }],
      })
      .sort({ displaySequence: 1 })
      .select("_id ");
    if (productIds && productIds.length > 0) {
      productIds = productIds.map((id) => id._id);
    }
    const productCombination =
      await customizedProductCombinationSchema.aggregate([
        {
          $match: {
            productId: { $in: productIds },
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
            { path: "Collection", select: "url" },
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

/** get all products  */
const getAllCustomizedproduct = async (req, res, next) => {
  try {
    const { search, limit, page, filter } = req.query;
    let collIds = [];
    let collectionIds;
    if (filter !== "" && filter !== undefined) {
      collIds = filter.split(",").map((id) => new ObjectId(id));
      const collections = await collectionSchema
        .find({
          rootPath: { $in: collIds },
        })
        .select("_id");
      collectionIds = collections.map((id) => id._id);
      collectionIds = [...collectionIds, ...collIds];
    }

    const searchTerm = search || "";
    const limits =
      parseInt(limit) || (await customizedProductSchema.countDocuments());
    const pageNo = parseInt(page) || 1;
    let query = {};
    if (collectionIds !== undefined && collectionIds.length > 0) {
      query.Collection = { $in: collectionIds };
    }
    if (searchTerm !== "") {
      query.ProductName = { $regex: searchTerm, $options: "i" };
    }
    const getProducts = await customizedProductSchema.aggregate([
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

    const resData = await customizedProductSchema.populate(getProducts, [
      { path: "attribute", select: "Name" },
      { path: "tags", select: "name" },
      { path: "Collection" },
    ]);
    const totalCount = await customizedProductSchema.countDocuments(query);

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

/** get single product by _id   */
const getproductById = async (req, res, next) => {
  try {
    const getProductById = await customizedProductSchema.aggregate([
      {
        $match: { _id: new ObjectId(req.params.id) },
      },
    ]);

    const resData = await customizedProductSchema.populate(getProductById, [
      { path: "attribute", select: "Name Display_Index" },
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

/** Get Product by tags */
const getProductByTags = async (req, res, next) => {
  try {
    const { tags } = req.body;

    const tagsId = tags.map((tag) => new ObjectId(tag));

    const customizedProduct = await customizedProductSchema.aggregate([
      {
        $match: {
          ProductStatus: "Active",
          tags: { $in: tagsId },
        },
      },
    ]);

    const customizedProductData = await customizedProductSchema.populate(
      customizedProduct,
      [{ path: "attribute" }]
    );

    const productId = customizedProductData.map(
      (product) => new ObjectId(product._id)
    );

    const productCombination = await customizeProductCombination.aggregate([
      {
        $match: {
          productId: { $in: productId },
        },
      },
    ]);

    const result = await customizeProductCombination.populate(
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
            select: "url",
          },
        },
      ]
    );

    res.status(200).json({
      success: true,
      data: result,
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

//  get Product Parameters And Postions by product id
// const getProductParametersAndPostions = async (req, res) => {
//   try {
//     const products = await customizedProductSchema.aggregate([
//       {
//         $match: { _id: new ObjectId(req.params.id) },
//       },
//     ]);

//     let product = products[0];
//     let parametes;
//     let positions;

//     if (products.length > 0) {
//       parametes = await parameterSchema.aggregate([
//         {
//           $match: { attributeId: { $in: product.attribute } },
//         },
//       ]);

//       positions = await positionSchema.aggregate([
//         {
//           $match: { attributeId: { $in: product.attribute } },
//         },
//       ]);
//     }

//     res.status(200).json({
//       success: true,
//       product: {},
//       parametes: [],
//       positions: [],
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const getProductParametersAndPostions = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);

    // const result = await customizedProductSchema.aggregate([
    //   {
    //     $match: { _id: productId },
    //   },
    //   {
    //     $unwind: "$attribute",
    //   },
    //   {
    //     $lookup: {
    //       from: parameterSchema.collection.name,
    //       localField: "attribute",
    //       foreignField: "attributeId",
    //       as: "parameters",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: positionSchema.collection.name,
    //       localField: "attribute",
    //       foreignField: "attributeId",
    //       as: "positions",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: attributeSchema.collection.name,
    //       localField: "attribute",
    //       foreignField: "_id",
    //       as: "attributeData",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$attribute",
    //       parameters: { $first: "$parameters" },
    //       positions: { $first: "$positions" },
    //       attributeData: { $first: "$attributeData" },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       attributeId: "$_id",
    //       parameters: 1,
    //       positions: 1,
    //       attributeData: { $arrayElemAt: ["$attributeData", 0] },
    //     },
    //   },
    // ]);

    const result = await customizedProductSchema.aggregate([
      {
        $match: { _id: productId },
      },
      {
        $unwind: "$attribute",
      },
      {
        $lookup: {
          from: parameterSchema.collection.name,
          localField: "attribute",
          foreignField: "attributeId",
          as: "parameters",
        },
      },
      {
        $lookup: {
          from: positionSchema.collection.name,
          localField: "attribute",
          foreignField: "attributeId",
          as: "positions",
        },
      },
      {
        $lookup: {
          from: attributeSchema.collection.name,
          localField: "attribute",
          foreignField: "_id",
          as: "attributeData",
        },
      },
      {
        $lookup: {
          from: AttributeCategorySchema.collection.name,
          localField: "parameters.attributeCategoryId",
          foreignField: "_id",
          as: "attributeCategories",
        },
      },
      {
        $group: {
          _id: "$attribute",
          parameters: { $first: "$parameters" },
          positions: { $first: "$positions" },
          attributeData: { $first: "$attributeData" },
          attributeCategories: { $first: "$attributeCategories" },
        },
      },
      {
        $project: {
          _id: 0,
          attributeId: "$_id",
          parameters: {
            $map: {
              input: "$parameters",
              as: "param",
              in: {
                $mergeObjects: [
                  "$$param",
                  {
                    attributeCategoryId: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$attributeCategories",
                            cond: {
                              $eq: [
                                "$$this._id",
                                "$$param.attributeCategoryId",
                              ],
                            },
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
          positions: 1,
          attributeData: { $arrayElemAt: ["$attributeData", 0] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** delete single product by id   */
const deleteCustomizedProductById = async (req, res, next) => {
  try {
    /** if customize product is not exist inside customized combo rectange */
    const existProductInCCR = await customizeComboRectangleModalSchema.find({
      addOnProduct: req.params.id,
    });
    if (existProductInCCR.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Customize Product used in custom combo rectange",
      });
    }

    let product;
    const existProduct = await customizeDotProductImageSchema.find({
      "dots.productId": req.params.id,
    });
    /** if customize product is not exist inside dot product */
    if (existProduct?.length === 0) {
      product = await customizedProductSchema.findByIdAndDelete(req.params.id);

      /**  delete all combinations of corresponding customize product id   */
      if (product?._id) {
        const deleteProductComb =
          await customizeProductCombination.findOneAndDelete({
            productId: product?._id,
          });
      }
      res.status(200).json({
        success: true,
        message: " Customize Product has deleted successfully",
        data: product,
      });
      return;
    }
    res.status(409).json({
      success: false,
      message: "Customize Product is in use ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCustomizedProduct,
  getAllCustomizedproduct,
  getproductById,
  getProductByTags,
  removeImage,
  deleteCustomizedProductById,
  updateCustomizedProductById,
  getProductParametersAndPostions,
  getWishlistProducts,
  getAllFeatureProducts,
};
