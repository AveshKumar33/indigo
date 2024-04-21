const customizeComboRectangleModalSchema = require("../modal/customizeComboRectangleModal");
const customizedComboModelSchema = require("../modal/customizedComboModel");
const customizedProductCombinationSchema = require("../modal/customizeProductCombinationModal");
const customizedProductSchema = require("../modal/customizeProductModel");
const parameterPositionImageSchema = require("../modal/parameterPositionImageModal");
const attributeNewSchema = require("../modal/attributeModalNew");
const positionSchema = require("../modal/positionModal");
const parameterSchema = require("../modal/parameterModal");
const uomSchema = require("../modal/UOMModal");

const { handleError } = require("../utils/handleError");
const { ObjectId } = require("mongodb");

const addCustomizedComRectangleboProduct = async (req, res, next) => {
  try {
    const data = new customizeComboRectangleModalSchema({
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const product = await data.save();

    res.status(201).json({
      success: true,
      data: product,
      message: "Product Added Successfully",
    });
  } catch (error) {
    console.log("error", error);
    next(handleError(500, error.message));
  }
};

/** get all attached products of customized combination  */
const getAllCustomizedCombo = async (req, res, next) => {
  try {
    const product = await customizeComboRectangleModalSchema
      .find({ customizedComboId: req.params.prouctId })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: product,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get dot product by _id  */
const getProductsById = async (req, res, next) => {
  try {
    const product = await customizeComboRectangleModalSchema.aggregate([
      {
        $match: {
          _id: new ObjectId(req.params.id),
        },
      },
    ]);

    const result = await customizeComboRectangleModalSchema.populate(product, [
      {
        path: "addOnProduct",
        select: "-createdBy -updatedBy -createdAt -updatedAt",
      },
      {
        path: "customizedComboId",
        select: "-createdBy -updatedBy -createdAt -updatedAt",
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

/** get all product  */
const getAllCustomizedCombinationsRectangle = async (req, res, next) => {
  try {
    const products = await customizeComboRectangleModalSchema.aggregate([
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

    const customizedProduct = await customizeComboRectangleModalSchema
      .find()
      .select("addOnProduct customizedComboId");

    const customizedProductIds = customizedProduct?.map(
      (data) => data.addOnProduct[0]
    );

    let combinations = await customizedProductCombinationSchema.aggregate([
      {
        $match: {
          productId: { $in: customizedProductIds },
        },
      },
      {
        $lookup: {
          from: customizedProductSchema.collection.name,
          localField: "productId",
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
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getAllCustomizedCombinationsRectangleById = async (req, res, next) => {
  try {
    const products = await customizeComboRectangleModalSchema.aggregate([
      {
        $match: { customizedComboId: new ObjectId(req.params.id) },
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

    const customizedProduct = await customizeComboRectangleModalSchema
      .find({ customizedComboId: req.params.id })
      .select("addOnProduct customizedComboId");

    const customizedProductIds = customizedProduct?.flatMap(
      (data) => data.addOnProduct
    );

    let combinations = await customizedProductCombinationSchema.aggregate([
      {
        $match: {
          productId: { $in: customizedProductIds },
        },
      },
      {
        $lookup: {
          from: customizedProductSchema.collection.name,
          localField: "productId",
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
        let foundCustomizedProduct = [];

        for (let addOnProd of rectangle.addOnProduct) {
          const foundData = combinations.find((combination) => {
            return (
              combination.product[0]._id.toString() === addOnProd.toString()
            );
          });

          if (foundData) {
            foundCustomizedProduct.push(foundData);
          }
        }
        rectangle.customizedProductDetails = foundCustomizedProduct;
      }

      result.push(product);
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "Data fetched Successfully",
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

    const updatedProduct =
      await customizeComboRectangleModalSchema.findByIdAndUpdate(
        req.params.id,
        {
          $set: productData,
        }
      );

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
    await customizeComboRectangleModalSchema.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  addCustomizedComRectangleboProduct,
  getAllCustomizedCombo,
  getProductsById,
  updateProduct,
  deleteDotProductById,
  getAllCustomizedCombinationsRectangle,
  getAllCustomizedCombinationsRectangleById,
};
