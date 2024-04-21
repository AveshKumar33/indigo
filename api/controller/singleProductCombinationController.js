const singleProductCombinationSchema = require("../modal/singleProductCombinationModal");
const customizeProductSchema = require("../modal/customizeProductModel");
const customizeProductCombinationSchema = require("../modal/customizeProductCombinationModal");
const singleProductSchema = require("../modal/singleProductModal");
const { handleError } = require("../utils/handleError");
const mongoose = require("mongoose");

/** get all products combinations  */
const getAllsingleProductCombination = async (req, res, next) => {
  try {
    const singleProductCombination = await singleProductCombinationSchema
      .find({ singleProductId: req.params.singleProductId })
      .populate([
        { path: "singleProductId" },
        { path: "combinations.parameterId" },
      ]);

    res.status(200).json({
      success: true,
      message: "All Single Product combination Data Fetched",
      data: singleProductCombination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get matched Product with product id
const getCombinationsByproductId = async (req, res, next) => {
  try {
    const SinProductId = req.params.siPId;

    console.log("getCombinationsByProductId", SinProductId);

    const productCombination = await singleProductCombinationSchema.aggregate([
      {
        $match: {
          singleProductId: new mongoose.Types.ObjectId(SinProductId),
          isDefault: true,
          SalePrice: { $gt: 0 },
        },
      },
    ]);

    const result = await singleProductCombinationSchema.populate(
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

const getSingleProductCombination = async (req, res, next) => {
  try {
    const combination = JSON.parse(req.query.search);

    const attributeIdArray = combination.map(
      (item) => new mongoose.Types.ObjectId(item.attributeId)
    );
    const parameterIdArray = combination.map(
      (item) => new mongoose.Types.ObjectId(item.parameterId)
    );

    const productId = combination[0].productId;

    const productCombinations = await singleProductCombinationSchema.aggregate([
      {
        $match: {
          singleProductId: new mongoose.Types.ObjectId(productId),
          SalePrice: { $gt: 0 },
          "combinations.attributeId": { $all: attributeIdArray },

          "combinations.parameterId": { $all: parameterIdArray },
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
      message: "All Single Product combination Data Fetched",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDefaultSingleProductCombinationByProductId = async (
  req,
  res,
  next
) => {
  try {
    const productCombinations = await singleProductCombinationSchema.aggregate([
      {
        $match: {
          singleProductId: new mongoose.Types.ObjectId(
            req.params.singleProductId
          ),
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
          select: "Name",
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
      message: "All Single Product combination Data Fetched",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** update all combinations  */
const updateProductCombinationsById = async (req, res, next) => {
  try {
    let imgdata;

    let updatedData = {
      ...req.body,
      updatedBy: req.user.id,
    };

    if (req.file) {
      console.log("req.file", req.file);
      updatedData.image = req.file.filename;
    }

    const updateOperation = {};
    if (imgdata) {
      updateOperation.$set = updatedData;
    } else {
      updateOperation.$set = updatedData;
    }
    const updatedDataRes =
      await singleProductCombinationSchema.findByIdAndUpdate(
        req.params.id,
        updateOperation
      );

    /** remove old  image from my server folder here  */
    if (req.file && updatedDataRes.image !== "default.png") {
      const imgpath = `images/product/${updatedDataRes.image}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }
    res.status(200).json({
      success: true,
      message: " Single Product combination Data updated Successfully",
      data: updatedDataRes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/** update all combinations by sinngle product id */
const updateAllProductCombinationsBySPId = async (req, res, next) => {
  try {
    const { spid, id } = req.params;
    await singleProductCombinationSchema.updateMany(
      { singleProductId: spid },
      { isDefault: false }
    );
    const updatedDataRes =
      await singleProductCombinationSchema.findByIdAndUpdate(id, req.body);

    res.status(200).json({
      success: true,
      message: " Single Product combination Data updated Successfully",
      data: updatedDataRes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const fullTextSearchFunctionality = async (req, res, next) => {
  try {
    let products = await singleProductSchema
      .find({
        ProductStatus: "Active",
        ProductName: { $regex: req.params.productname.trim(), $options: "i" },
      })
      .populate("attribute");

    const productId = products.map(
      (product) => new mongoose.Types.ObjectId(product._id)
    );

    let productCombination = [];
    let result = [];

    if (productId?.length > 0) {
      productCombination = await singleProductCombinationSchema.aggregate([
        {
          $match: {
            singleProductId: { $in: productId },
            isDefault: true,
            SalePrice: { $gt: 0 },
          },
        },
      ]);

      result = await singleProductCombinationSchema.populate(
        productCombination,
        [
          {
            path: "parameterIds",
            select: "name profileImage",
          },
          {
            path: "singleProductId",
            populate: [
              {
                path: "attribute",
              },
              {
                path: "Collection",
                select: "title url",
              },
            ],
          },
        ]
      );
    }

    const customizedProduct = await customizeProductSchema.aggregate([
      {
        $match: {
          ProductStatus: "Active",
          ProductName: { $regex: req.params.productname.trim(), $options: "i" },
        },
      },
    ]);

    const customizedProductData = await customizeProductSchema.populate(
      customizedProduct,
      [{ path: "attribute" }, { path: "Collection" }]
    );

    let customizeResult = [];

    if (customizedProductData?.length > 0) {
      const custommizeProductId = customizedProductData.map(
        (product) => new mongoose.Types.ObjectId(product._id)
      );

      const customizedProductCombination =
        await customizeProductCombinationSchema.aggregate([
          {
            $match: {
              productId: { $in: custommizeProductId },
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

      customizeResult = await customizeProductCombinationSchema.populate(
        customizedProductCombination,
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
              select: "title url",
            },
          },
        ]
      );
    }

    res.status(200).json({
      success: true,
      productsCombinations: result,
      customizeProductsCombinations: customizeResult,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllsingleProductCombination,
  getSingleProductCombination,
  getDefaultSingleProductCombinationByProductId,
  updateProductCombinationsById,
  updateAllProductCombinationsBySPId,
  fullTextSearchFunctionality,
  getCombinationsByproductId,
};
