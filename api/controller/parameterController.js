const parameterSchema = require("../modal/parameterModal");
const {
  createCombinationOnParameterCreate,
} = require("../shared/singleProductCombination");
const singleProductSchema = require("../modal/singleProductModal");
const singleProductCombinationSchema = require("../modal/singleProductCombinationModal");
const attributeNewSchema = require("../modal/attributeModalNew");
const attributeCategorySchema = require("../modal/AttributeCategoryModal");
const UOMMSchema = require("../modal/UOMModal");
const positionSchema = require("../modal/positionModal");
const positionParameterImageSchema = require("../modal/parameterPositionImageModal");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const { handleError } = require("../utils/handleError");
const fs = require("fs");

/** get all parameter   */
const getAllParameter = async (req, res, next) => {
  try {
    let parameter = await parameterSchema
      .find({})
      .populate("attributeCategoryId", { Name: 1 })
      .populate("attributeId", { Name: 1 })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: parameter,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** group all document count accourding to attribte id */
const getAllSimilerAttCount = async (req, res, next) => {
  try {
    const aggregatedResults = await parameterSchema.aggregate([
      {
        $group: {
          _id: "$attributeId",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          attributeId: { $toString: "$_id" },
          count: 1,
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: { k: "$attributeId", v: "$count" } },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: "$data" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: aggregatedResults,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get parameter by id */
const getParameterById = async (req, res, next) => {
  try {
    const parameter = await parameterSchema
      .findById(req.params.id)
      .populate("attributeCategoryId")
      .populate("attributeId");

    res.status(200).json({
      success: true,
      data: parameter,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get parameter by  attribute id */
const getParameterByAttributeId = async (req, res, next) => {
  try {
    const attributeId = req.params.id;
    const { search, limit, page } = req.query;
    const yourSearchTerm = search || "";
    const pageNo = parseInt(page) || 1;
    const limits = parseInt(limit) || 100000;

    let query = {};
    if (attributeId) {
      query.attributeId = attributeId;
    }

    if (yourSearchTerm) {
      const isNumber = Number(yourSearchTerm);
      if (isNaN(isNumber)) {
        query.name = { $regex: yourSearchTerm, $options: "i" };
      } else {
        query["$or"] = [{ price: isNumber }, { displayIndex: isNumber }];
      }
    }
    const parameter = await parameterSchema
      .find(query)
      .sort({ updatedAt: -1 })
      .skip((pageNo - 1) * limits)
      .limit(limits)
      .populate([
        { path: "attributeId", select: { Name: 1 } },
        { path: "attributeCategoryId", select: { Name: 1 } },
      ])
      .lean();

    const totalCount = await parameterSchema.find(query).count();

    res.status(200).json({
      success: true,
      totalCount: totalCount,
      data: parameter,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// const getAllParameterByAttributeId = async (req, res, next) => {
//   try {
//     const attributeId = req.params.id;

//     const parameter = await parameterSchema.aggregate([
//       {
//         $match: { attributeId: new mongoose.Types.ObjectId(attributeId) },
//       },
//       {
//         $sort: { displayIndex: 1 },
//       },
//     ]);

//     const result = await parameterSchema.populate(parameter, [
//       {
//         path: "attributeId",
//         select: "Name UOMId",
//         populate: {
//           path: "UOMId",
//           select: "name status",
//         },
//       },
//       {
//         path: "attributeCategoryId",
//         select: "Name displayIndex",
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: result,
//       message: "Data Fetched Successfully",
//     });
//   } catch (error) {
//     next(handleError(500, error.message));
//   }
// };

// for customized Product
const getAllParameterByAttributeId = async (req, res, next) => {
  try {
    const attributeId = req.params.id;
    const parameters = await parameterSchema.aggregate([
      {
        $match: { attributeId: new mongoose.Types.ObjectId(attributeId) },
      },
      {
        $sort: { displayIndex: 1 },
      },
      {
        $lookup: {
          from: attributeCategorySchema.collection.name,
          localField: "attributeCategoryId",
          foreignField: "_id",
          as: "attributeCategory",
        },
      },
      {
        $unwind: "$attributeCategory",
      },
      {
        $lookup: {
          from: attributeNewSchema.collection.name,
          localField: "attributeId",
          foreignField: "_id",
          as: "attribute",
        },
      },
      {
        $unwind: "$attribute",
      },
      {
        $lookup: {
          from: UOMMSchema.collection.name,
          localField: "attribute.UOMId",
          foreignField: "_id",
          as: "uom",
        },
      },
      {
        $unwind: "$uom",
      },
      {
        $group: {
          _id: "$attributeCategoryId",
          attributeCategoryId: { $first: "$attributeCategory._id" },
          attributeCategoryName: { $first: "$attributeCategory.Name" },
          displayIndex: { $first: "$attributeCategory.displayIndex" },
          attribute: { $first: "$attribute" },
          parameters: {
            $push: {
              _id: "$_id",
              name: "$name",
              UOMId: "$uom._id",
              UOMName: "$uom.name",
              UOMStatus: "$uom.status",
              displayIndex: "$displayIndex",
              price: "$price",
              profileImage: "$profileImage",
              status: "$status",
            },
          },
        },
      },
      // {
      //   $sort: { displayIndex: 1 },
      // },
    ]);

    res.status(200).json({
      success: true,
      data: parameters,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error.message));
  }
};

// for single Product
const getAllSingleProductParameterByAttributeId = async (req, res, next) => {
  try {
    const attributeId = req.params.id;

    const parameters = await parameterSchema.aggregate([
      {
        $match: { attributeId: new mongoose.Types.ObjectId(attributeId) },
      },
      {
        $sort: { displayIndex: 1 },
      },
      {
        $lookup: {
          from: attributeCategorySchema.collection.name,
          localField: "attributeCategoryId",
          foreignField: "_id",
          as: "attributeCategory",
        },
      },
      {
        $lookup: {
          from: attributeNewSchema.collection.name,
          localField: "attributeId",
          foreignField: "_id",
          as: "attribute",
        },
      },

      {
        $group: {
          _id: "$attributeCategoryId",
          attributeCategoryId: {
            $first: { $arrayElemAt: ["$attributeCategory._id", 0] },
          },
          attributeCategoryName: {
            $first: { $arrayElemAt: ["$attributeCategory.Name", 0] },
          },
          displayIndex: {
            $first: { $arrayElemAt: ["$attributeCategory.displayIndex", 0] },
          },
          attribute: {
            $first: { $arrayElemAt: ["$attribute", 0] },
          },
          parameters: {
            $push: {
              _id: "$_id",
              name: "$name",
              displayIndex: "$displayIndex",
              price: "$price",
              profileImage: "$profileImage",
              status: "$status",
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: parameters,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error.message));
  }
};

/** create parameters */
const createParameter = async (req, res, next) => {
  try {
    const {
      name,
      attributeCategoryId,
      attributeId,
      displayIndex,
      status,
      price,
    } = req.body;
    const profileImage = req.file.filename;

    const parameterData = new parameterSchema({
      name,
      attributeCategoryId,
      attributeId,
      displayIndex,
      profileImage,
      status,
      price,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const savedParameter = await parameterData.save();

    /** create all combinations having parameterId and attributeId  with corresponding positionId*/

    const savedAttributeid = savedParameter?.attributeId;
    const parameterId = savedParameter?._id;

    const foundProduct = await singleProductSchema.aggregate([
      {
        $match: {
          attribute: new mongoose.Types.ObjectId(savedAttributeid),
        },
      },
      {
        $project: {
          _id: 1,
          attribute: 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          items: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          items: 1,
        },
      },
    ]);

    const AllItems = foundProduct.map((item) => item.items);

    // const filteredProduct = foundProduct.map((product) => {
    //   if (product.attribute !== savedAttributeid) {
    //     return product.attribute;
    //   }
    // });

    const updatedData = AllItems.map((subArray) => {
      const obj = subArray[0];
      const arrArr = [...obj.attribute];
      obj.attribute = arrArr.filter(
        (attr) => attr.toString() !== savedAttributeid.toString()
      );
      return subArray;
    });

    await createCombinationOnParameterCreate(
      updatedData,
      parameterId,
      savedAttributeid,
      req.user.id
    );

    // console.log(JSON.stringify(updatedData));

    //---------------------------------------------------

    const allPositions = await positionSchema.find(
      { attributeId: savedAttributeid },
      { _id: 1 }
    );

    if (allPositions.length > 0) {
      const combinedObjectsArray = allPositions.map((obj) => ({
        attributeId: savedAttributeid,
        parameterId: parameterId,
        positionId: obj._id,
        createdBy: req?.user?.id,
        updatedBy: req?.user?.id,
        pngImage: "parameterPositiondefaultImage.png",
      }));
      const positionParameterData =
        await positionParameterImageSchema.insertMany(combinedObjectsArray);
    }

    res.status(200).json({
      success: true,
      savedAttributeid: savedAttributeid,
      data: updatedData,
      message: "Parameter Created Successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      next(handleError(500, "Parameter already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

/** get attribute to filter and having atleast one parameter*/
const getAttributeByFilter = async (req, res, next) => {
  try {
    let filter = req.query.filter || "";
    filter = filter === "true" ? true : false;
    const attribute = await parameterSchema.aggregate([
      {
        $lookup: {
          from: attributeNewSchema.collection.name,
          localField: "attributeId",
          foreignField: "_id",
          as: "attributes",
        },
      },
      {
        $unwind: "$attributes",
      },
      {
        $match: {
          "attributes.isVisibleInCustomize": filter,
        },
      },
      {
        $project: {
          "attributes.Name": 1,
          "attributes._id": 1,
        },
      },
      {
        $group: {
          _id: "$attributes._id",
          Name: { $first: "$attributes.Name" },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: attribute,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** update parameters */
const updateParameterById = async (req, res, next) => {
  try {
    const {
      name,
      attributeCategoryId,
      attributeId,
      displayIndex,
      status,
      price,
    } = req.body;

    const parameterData = {
      name,
      attributeCategoryId,
      attributeId,
      displayIndex,
      status,
      price,
      updatedBy: req.user.id,
    };

    if (req.file) {
      parameterData.profileImage = req.file.filename;
    }

    const updatedParameter = await parameterSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: parameterData,
      }
    );

    if (req.file && updatedParameter.profileImage !== "default.png") {
      const imgpath = `images/parameter/${updatedParameter.profileImage}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedParameter,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** delete parameter by Id */
const deleteParameterById = async (req, res, next) => {
  try {
    const existCom = await singleProductCombinationSchema.find({
      "combinations.parameterId": req.params.id,
      isDefault: true,
    });

    if (existCom.length === 1) {
      return res.status(409).json({
        success: true,
        message: "Cann't delete default single product combination",
      });
    }

    const parameter = await parameterSchema.findByIdAndDelete(req.params.id);
    if (parameter) {
      const imgpath = `images/parameter/${parameter.profileImage}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    /** delete all combinations having parameterId and attributeId */
    await positionParameterImageSchema.deleteMany({
      $and: [
        { parameterId: parameter._id },
        { attributeId: parameter.attributeId },
      ],
    });

    if (parameter) {
      await singleProductCombinationSchema.deleteMany({
        "combinations.parameterId": parameter._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Parameter Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteParameterById,
  getParameterById,
  updateParameterById,
  createParameter,
  getAllParameter,
  getParameterByAttributeId,
  getAllSingleProductParameterByAttributeId,
  getAllSimilerAttCount,
  getAttributeByFilter,
  getAllParameterByAttributeId,
};
