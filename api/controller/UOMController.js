const UOMSchema = require("../modal/UOMModal");
const { handleError } = require("../utils/handleError");

/** get all UOM s */
const getAllUOM = async (req, res, next) => {
  try {
    const uoms = await UOMSchema.find();
    res.status(200).json({
      success: true,
      data: uoms,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** create UOM s */
const createUOM = async (req, res, next) => {
  try {
    const uoms = await UOMSchema.create({
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });
    res.status(200).json({
      success: true,
      message: "UOM's Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "UOM's already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

/** update UOM s */
const updateUOM = async (req, res, next) => {
  try {
    const uoms = await UOMSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: { updatedBy: req.user.id, ...req.body },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: uoms,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get UOM s by id */
const getUOMById = async (req, res, next) => {
  try {
    const uoms = await UOMSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: uoms,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** delete UOM s by Id */
const deleteUOM = async (req, res, next) => {
  try {
    const uoms = await UOMSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "UOM's Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = { deleteUOM, getUOMById, updateUOM, createUOM, getAllUOM };
