const positionSchema = require("../modal/positionModal");
const parameterSchema = require("../modal/parameterModal");
const positionParameterImageSchema = require("../modal/parameterPositionImageModal");
const { handleError } = require("../utils/handleError");

/** get all position   */
const getAllPosition = async (req, res, next) => {
  try {
    const position = await positionSchema.find().populate("attributeId");

    res.status(200).json({
      success: true,
      data: position,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** group all document count accourding to attribte id */
const getAllSimilerAttCount = async (req, res, next) => {
  try {
    const aggregatedResults = await positionSchema.aggregate([
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

/** get position by id */
const getPositionById = async (req, res, next) => {
  try {
    const position = await positionSchema
      .findById(req.params.id)
      .populate("attributeId");

    res.status(200).json({
      success: true,
      data: position,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** create position */
const createPosition = async (req, res, next) => {
  try {
    const savePosition = await positionSchema.create({
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });

    /** create all combinations having positionId and attributeId  with corresponding parameteId*/

    const savedAttributeid = savePosition?.attributeId;
    const positionId = savePosition?._id;
    const allParameters = await parameterSchema.find(
      { attributeId: savedAttributeid },
      { _id: 1 }
    );
    const combinedObjectsArray = allParameters.map((obj) => ({
      attributeId: savedAttributeid,
      parameterId: obj._id,
      positionId: positionId,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      pngImage: "parameterPositiondefaultImage.png",
    }));
    const positionParameterData = await positionParameterImageSchema.insertMany(
      combinedObjectsArray
    );

    res.status(200).json({
      success: true,
      message: "Position Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "Position already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

/** update position */
const updatePositionById = async (req, res, next) => {
  try {
    const position = await positionSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: { updatedBy: req.user.id, ...req.body },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: position,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** delete position by Id */
const deletePositionById = async (req, res, next) => {
  try {
    const position = await positionSchema.findByIdAndDelete(req.params.id);
    /** delete all combinations having positionId and attributeId */
    const positionParameterData = await positionParameterImageSchema.deleteMany(
      {
        $and: [
          { positionId: position._id },
          { attributeId: position.attributeId },
        ],
      }
    );
    res.status(200).json({
      success: true,
      message: "Position Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get position by  attribute id */
const getPositionByAttributeId = async (req, res, next) => {
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
      }
    }

    const position = await positionSchema
      .find(query)
      .sort({ updatedAt: -1 })
      .skip((pageNo - 1) * limits)
      .limit(limits)
      .populate("attributeId", { Name: 1 });

    const totalCount = await positionSchema.countDocuments(query);

    res.status(200).json({
      success: true,
      totalCount: totalCount,
      data: position,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deletePositionById,
  getPositionById,
  updatePositionById,
  createPosition,
  getAllPosition,
  getPositionByAttributeId,
  getAllSimilerAttCount,
};
