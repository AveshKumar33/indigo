const customizedComboModelSchema = require("../modal/customizedComboModel");
const customizeComboRectangleModalSchema = require("../modal/customizeComboRectangleModal");
const customizedProductCombinationSchema = require("../modal/customizeProductCombinationModal");
const customizedProductSchema = require("../modal/customizeProductModel");
const parameterPositionImageSchema = require("../modal/parameterPositionImageModal");
const attributeNewSchema = require("../modal/attributeModalNew");
const parameterSchema = require("../modal/parameterModal");
const positionSchema = require("../modal/positionModal");
const uomSchema = require("../modal/UOMModal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");
const { ObjectId } = require("mongodb");

/** create customized ComboController  */
const customizedComboProduct = async (req, res, next) => {
  try {
    const data = new customizedComboModelSchema({
      ...req.body,
      ...(req.file && { image: req.file.filename || "" }),
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const product = await data.save();

    res.status(201).json({
      success: true,
      data: product,
      message: "Product Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
/**get all wishlist  single products by ids   */
const getWishlistProducts = async (req, res, next) => {
  const { filter } = req.query;
  const prodId = JSON.parse(filter);

  let productIds = [];
  if (prodId && prodId?.length > 0) {
    productIds = prodId.map((id) => new ObjectId(id));
  }

  try {
    const products = await customizeComboRectangleModalSchema.aggregate([
      {
        $match: {
          customizedComboId: { $in: productIds },
        },
      },
      {
        $lookup: {
          from: customizedComboModelSchema.collection.name,
          localField: "customizedComboId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $group: {
          _id: "$customizedComboId",
          customizedComboId: {
            $first: { $arrayElemAt: ["$productDetails", 0] },
          },
          rectangles: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 1,
          customizedComboId: 1,
          rectangles: 1,
        },
      },
    ]);

    let combinations = await customizedProductCombinationSchema.aggregate([
      {
        $match: {
          customizedComboId: { $in: productIds },
        },
      },
      {
        $lookup: {
          from: customizedProductSchema.collection.name,
          localField: "customizedComboId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $lookup: {
          from: parameterPositionImageSchema.collection.name,
          let: {
            allAttributes: {
              $concatArrays: [
                "$Front.attributeId",
                "$SAF.attributeId",
                "$IB.attributeId",
                "$CB.attributeId",
              ],
            },
            allParameters: {
              $concatArrays: [
                "$Front.parameterId",
                "$SAF.parameterId",
                "$IB.parameterId",
                "$CB.parameterId",
              ],
            },
            allPositions: {
              $concatArrays: [
                "$Front.positionId",
                "$SAF.positionId",
                "$IB.positionId",
                "$CB.positionId",
              ],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $in: ["$attributeId", "$$allAttributes"] },
                        { $in: ["$parameterId", "$$allParameters"] },
                        { $in: ["$positionId", "$$allPositions"] },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                attributeId: 1,
                positionId: 1,
                parameterId: 1,
                pngImage: 1,
              },
            },
          ],
          as: "combinations",
        },
      },
      {
        $lookup: {
          from: attributeNewSchema.collection.name,
          localField: "combinations.attributeId",
          foreignField: "_id",
          as: "attributeDetails",
        },
      },
      {
        $lookup: {
          from: positionSchema.collection.name,
          localField: "combinations.positionId",
          foreignField: "_id",
          as: "positionDetails",
        },
      },
      {
        $lookup: {
          from: parameterSchema.collection.name,
          localField: "combinations.parameterId",
          foreignField: "_id",
          as: "parameterDetails",
        },
      },
      {
        $lookup: {
          from: uomSchema.collection.name,
          localField: "attributeDetails.UOMId",
          foreignField: "_id",
          as: "uomDetails",
        },
      },
      {
        $project: {
          product: 1,
          Front: generateCombinedArray("$Front"),
          SAF: generateCombinedArray("$SAF"),
          IB: generateCombinedArray("$IB"),
          CB: generateCombinedArray("$CB"),
          UOM: "$uomDetails",
        },
      },
    ]);

    function generateCombinedArray(arrayPath) {
      return {
        $map: {
          input: {
            $filter: {
              input: arrayPath,
              as: "item",
              cond: { $eq: ["$$item.isShow", true] },
            },
          },
          as: "item",
          in: {
            $mergeObjects: [
              "$$item",
              {
                attributeId: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$attributeDetails",
                        as: "attr",
                        cond: { $eq: ["$$attr._id", "$$item.attributeId"] },
                      },
                    },
                    0,
                  ],
                },
                combinations: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$combinations",
                        as: "combItem",
                        cond: {
                          $and: [
                            {
                              $eq: [
                                "$$item.attributeId",
                                "$$combItem.attributeId",
                              ],
                            },
                            {
                              $eq: [
                                "$$item.parameterId",
                                "$$combItem.parameterId",
                              ],
                            },
                            {
                              $eq: [
                                "$$item.positionId",
                                "$$combItem.positionId",
                              ],
                            },
                          ],
                        },
                      },
                    },
                    as: "filteredCombItem",
                    in: {
                      $mergeObjects: [
                        "$$filteredCombItem",
                        {
                          attributeId: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$attributeDetails",
                                  as: "attr",
                                  cond: {
                                    $eq: [
                                      "$$attr._id",
                                      "$$filteredCombItem.attributeId",
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                          positionId: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$positionDetails",
                                  as: "pos",
                                  cond: {
                                    $eq: [
                                      "$$pos._id",
                                      "$$filteredCombItem.positionId",
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                          parameterId: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$parameterDetails",
                                  as: "param",
                                  cond: {
                                    $eq: [
                                      "$$param._id",
                                      "$$filteredCombItem.parameterId",
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
              },
            ],
          },
        },
      };
    }

    const result = [];

    for (let product of products) {
      for (let rectangle of product.rectangles) {
        const foundData = combinations.find((combination) => {
          if (
            combination.product[0]._id.toString() ===
            rectangle.addOnProduct[0].toString()
          ) {
            return combination;
          }
        });

        if (foundData) {
          rectangle.customizedProductDetails = foundData;
        }
      }

      result.push(product);
    }
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

/** get all dot products  */
const getAllCustomizedCombo = async (req, res, next) => {
  try {
    const { search, limit, page } = req.query;
    const searchTerm = search || "";
    const limits = parseInt(limit) || 10000;
    const pageNo = parseInt(page) || 1;

    let query = {};
    if (searchTerm !== "") {
      query.Name = { $regex: searchTerm, $options: "i" };
    }
    const dotProduct = await customizedComboModelSchema
      .find(query)
      .sort({ updatedAt: -1 })
      .skip((pageNo - 1) * limits)
      .limit(limits);

    const totalCount = await customizedComboModelSchema.countDocuments(query);
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

/** get dot product by _id  */
const getProductsById = async (req, res, next) => {
  try {
    const product = await customizedComboModelSchema.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.id),
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: product,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** update product by _id */
const updateProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      updatedBy: req.user.id,
    };

    if (req.file) {
      productData.image = req.file.filename;
    }

    const updatedProduct = await customizedComboModelSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: productData,
      }
    );

    if (req.file) {
      const imgpath = `images/product/${updatedProduct.image}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** delete dot product by _id */
const deleteDotProductById = async (req, res, next) => {
  try {
    const product = await customizedComboModelSchema.findByIdAndDelete(
      req.params.id
    );
    /**if customize combo delete then all combination will bw deleted here */
    if (product._id) {
      await customizeComboRectangleModalSchema.deleteMany({
        customizedComboId: product._id,
      });
    }

    if (product) {
      const imgpath = `images/product/${product.image}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  customizedComboProduct,
  getAllCustomizedCombo,
  getProductsById,
  updateProduct,
  deleteDotProductById,
  getWishlistProducts,
};
