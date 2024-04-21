const attributeNewSchema = require("../modal/attributeModalNew");
const { handleError } = require("../utils/handleError");
const parameterSchema = require("../modal/parameterModal");
const positionSchema = require("../modal/positionModal");
const singleProductSchema = require("../modal/singleProductModal");

/** get all attribute new  */
const getAllAttribute = async (req, res, next) => {
  try {
    const { search, limit, page } = req.query;
    const searchData = JSON.parse(search) || {
      text: "",
      attributeType: "",
    };

    let { text, attributeType } = searchData;
    const pageNo = parseInt(page) || 1;
    const limits = parseInt(limit) || 100000;

    let query = {};
    if (attributeType !== "") {
      attributeType = attributeType === "true" ? true : false;
      query.isVisibleInCustomize = attributeType;
    }

    if (text) {
      query["$or"] = [
        { Name: { $regex: text.trim(), $options: "i" } },
        { PrintName: { $regex: text.trim(), $options: "i" } },
      ];
    }

    const attribute = await attributeNewSchema
      .find(query)
      .sort({ Display_Index: -1 })
      .skip((pageNo - 1) * limits)
      .limit(limits)
      .populate({ path: "UOMId", select: "name" });

    const totalCount = await attributeNewSchema.countDocuments(query);

    res.status(200).json({
      success: true,
      data: attribute,
      totalCount: totalCount,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** create attribute */
const createAttribute = async (req, res, next) => {
  try {
    const attribute = await attributeNewSchema.create({
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });
    res.status(200).json({
      success: true,
      message: "Attributes Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "Attribute already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

/** update attribute*/
const updateAttribute = async (req, res, next) => {
  try {
    const attribute = await attributeNewSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: { updatedBy: req.user.id, ...req.body },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: attribute,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get attribute by id */
const getAttributeById = async (req, res, next) => {
  try {
    const attribute = await attributeNewSchema
      .findById(req.params.id)
      .populate("UOMId");
    res.status(200).json({
      success: true,
      data: attribute,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** delete attribute by Id */
const deleteAttribute = async (req, res, next) => {
  try {
    const parameterExist = await parameterSchema.find({
      attributeId: req.params.id,
    });
    const existInProduct = await singleProductSchema.find({
      attribute: { $in: req.params.id },
    });
    const positionExist = await positionSchema.find({
      attributeId: req.params.id,
    });
    if (existInProduct.length > 0) {
      res.status(409).json({
        success: false,
        message: "Attribute is use in Product",
      });
      return;
    }
    if (parameterExist.length > 0 || positionExist.length > 0) {
      res.status(409).json({
        success: false,
        message: "Parameter or Position Exist in Attribute",
      });
      return;
    }
    const attribute = await attributeNewSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Attribute Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteAttribute,
  getAttributeById,
  updateAttribute,
  createAttribute,
  getAllAttribute,
};
