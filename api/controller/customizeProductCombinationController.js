const customizedProductCombinationSchema = require("../modal/customizeProductCombinationModal");
const parameterPositionImageSchema = require("../modal/parameterPositionImageModal");
const customizedProductSchema = require("../modal/customizeProductModel");
const attributeNewSchema = require("../modal/attributeModalNew");
const uomSchema = require("../modal/UOMModal");
const positionSchema = require("../modal/positionModal");
const parameterSchema = require("../modal/parameterModal");
const { handleError } = require("../utils/handleError");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

/** create new Customized product Combination  */
const createCustomizedProductCombination = async (req, res, next) => {
  // res.send(req.body)
  try {
    let { productId, Front, SAF, CB, IB, ...rest } = req.body;
    let filter = { productId: productId };
    let update = {
      productId: productId,
      Front: Front,
      SAF: SAF,
      CB: CB,
      IB: IB,
      ...rest,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    };

    /**  Customized product Combination is saving  here */
    await customizedProductCombinationSchema.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
    });
    res.status(201).json({
      success: true,
      message: "New customized Product Combination created successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get Customized product Combination by product id   */
const getCustomizedProductCombinationById = async (req, res, next) => {
  try {
    const getProductById = await customizedProductCombinationSchema
      .findOne({ productId: req.params.pid })
      .populate([
        {
          path: "Front.parameterId",
          select: "name attributeCategoryId",
          populate: { path: "attributeCategoryId", select: "Name" },
        },
        {
          path: "SAF.parameterId",
          select: "name attributeCategoryId",
          populate: { path: "attributeCategoryId", select: "Name" },
        },
        {
          path: "CB.parameterId",
          select: "name attributeCategoryId",
          populate: { path: "attributeCategoryId", select: "Name" },
        },
        {
          path: "IB.parameterId",
          select: "name attributeCategoryId",
          populate: { path: "attributeCategoryId", select: "Name" },
        },
        { path: "Front.positionId", select: "name" },
        { path: "IB.positionId", select: "name" },
        { path: "CB.positionId", select: "name" },
        { path: "SAF.positionId", select: "name" },
      ]);

    res.status(200).json({
      success: true,
      message: "Get Customized product Combination Data  by id ",
      data: getProductById,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** get all Customized product Combination  */
const getAllCustomizedproductCombination = async (req, res, next) => {
  try {
    // const { search, limit, page } = req.query;
    // const searchTerm = search || "";
    // const limits = parseInt(limit) || 10000;
    // const pageNo = parseInt(page) || 1;
    // let query = {};

    // if (searchTerm !== "") {
    //   query.ProductName = { $regex: searchTerm, $options: "i" };
    // }
    const getProducts = await customizedProductCombinationSchema
      .find()
      .populate("productId");

    // const resData = await customizedProductCombinationSchema.populate(
    //   getProducts,
    //   [
    //     { path: "attribute", select: "Name" },
    //     { path: "tags", select: "name" },
    //     { path: "Collection" },
    //   ]
    // );
    // const totalCount =
    //   await customizedProductCombinationSchema.countDocuments();

    res.status(200).json({
      success: true,
      //   totalCount: totalCount,
      message: "All Customized Product Combination Data Fetched",
      data: getProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// by Id
const fetchCustomizeProductWithCombinationsById = async (req, res, next) => {
  try {
    let combinations = await customizedProductCombinationSchema.aggregate([
      {
        $match: {
          productId: new ObjectId(req.params.pid),
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

    res.status(200).json({
      success: true,
      data: combinations[0],
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product Not Fetched Successfully",
    });
  }
};

const fetchCustomizeProductWithCombinationsByUrl = async (req, res, next) => {
  try {
    const customizedProduct = await customizedProductSchema.aggregate([
      {
        $match: { Urlhandle: req.params.url },
      },
    ]);

    if (customizedProduct?.length === 0) {
      res.status(404).json({
        success: false,
        data: combinations[0],
        message: "Product Not Found!",
      });

      return;
    }

    const customizedProductId = customizedProduct[0]._id;

    let combinations = await customizedProductCombinationSchema.aggregate([
      {
        $match: {
          productId: new ObjectId(customizedProductId),
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

    res.status(200).json({
      success: true,
      data: combinations[0],
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product Not Fetched Successfully",
    });
  }
};

const getAllCustomizedproductCombinationProductIds = async (req, res, next) => {
  try {
    const getProducts = await customizedProductCombinationSchema
      .find()
      .select("productId");

    const data = {};

    for (let res of getProducts) {
      data[res.productId] = res.productId;
    }

    res.status(200).json({
      success: true,
      message: "All Customized Product Combination Data Fetched",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCombinationsByproductId = async (req, res, next) => {
  try {
    const cusProductId = req.params.cusPId;

    const productCombination =
      await customizedProductCombinationSchema.aggregate([
        {
          $match: {
            productId: new mongoose.Types.ObjectId(cusProductId),
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
      customizeProductsCombinations: result,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: " CUSTOMIZED Product Not Fetched Successfully",
    });
  }
};

/** update Customized product Combination1` by _id */
// const updateCustomizedProductCombinationById = async (req, res, next) => {
//   try {
//     let imgdata = [];
//     if (req.files || req.file) {
//       req.files.map((m) => imgdata.push(m.filename));
//     }

//     let {
//       tags,
//       Installment,
//       attribute,
//       ProductImage,
//       Collection,
//       CollectionChild,
//       ...rest
//     } = req.body;

//     let productdata = {
//       tags: JSON.parse(tags),
//       Installment: JSON.parse(Installment),
//       attribute: JSON.parse(attribute),
//       // CollectionChild: JSON.parse(CollectionChild),
//       Collection: JSON.parse(Collection),
//       ...rest,
//       updatedBy: req.user.id,
//     };

//     const updateOperation = {};
//     if (imgdata?.length !== 0) {
//       updateOperation.$push = { ProductImage: imgdata };
//       updateOperation.$set = productdata;
//     } else {
//       updateOperation.$set = productdata;
//     }

//     try {
//       const product =
//         await customizedProductCombinationSchema.findByIdAndUpdate(
//           req.params.id,
//           updateOperation
//         );

//       if (req.file) {
//         const imgpath = `images/product/${product.ProductImage}`;
//         if (fs.existsSync(imgpath)) {
//           fs.unlinkSync(imgpath);
//         }
//       }

//       res.status(200).json({
//         success: true,
//         message: " Product Data updated Fetched",
//         data: product,
//       });
//     } catch (error) {
//       if (error.code === 11000) {
//         return next(handleError(500, "Same Product Url Already Present"));
//       } else {
//         next(handleError(500, error.message));
//       }
//     }
//   } catch (error) {
//     console.log(error, "check this error");
//   }
// };

/** delete single product by id   */
// const deleteCustomizedProductCombinationById = async (req, res, next) => {
//   try {
//     await customizedProductCombinationSchema.findByIdAndDelete(req.params.id);
//     /**  delete all combinations of corresponding product id   */
//     res.status(201).json({
//       success: false,
//       message: "Product Deleted",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

module.exports = {
  createCustomizedProductCombination,
  getAllCustomizedproductCombination,
  getCustomizedProductCombinationById,
  fetchCustomizeProductWithCombinationsById,
  fetchCustomizeProductWithCombinationsByUrl,
  getAllCustomizedproductCombinationProductIds,
  getCombinationsByproductId,
  //   deleteCustomizedProductCombinationById,
  //   updateCustomizedProductCombinationById,
};
