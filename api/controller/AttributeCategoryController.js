const AttributeCategorSchema = require("../modal/AttributeCategoryModal");
const { handleError } = require("../utils/handleError");

const getAttributeCategors = async (req, res, next) => {
  const { search, page, limit } = req.query;
  const searchTerm = search || "";
  const limits = parseInt(limit) || 10000;
  const pageNo = parseInt(page) || 1;
  let query = {};
  if (searchTerm !== "") {
    query.Name = { $regex: searchTerm, $options: "i" };
  }
  try {
    const AttributeCategors = await AttributeCategorSchema.find(query)
      .select("-createdAt -createdBy -updatedAt -updatedBy")
      .sort({ displayIndex: 1 })
      .skip((pageNo - 1) * limits)
      .limit(limits);

    const totalCount = await AttributeCategorSchema.countDocuments(query);

    res.status(200).json({
      success: true,
      data: AttributeCategors,
      totalCount: totalCount,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const posAttributeCategors = async (req, res, next) => {
  try {
    const AttributeCategors = await AttributeCategorSchema.create({
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });
    res.status(200).json({
      success: true,
      message: "AttributeCategors Created Successfully",
      data: AttributeCategors,
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "AttributeCategors already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const putAttributeCategors = async (req, res, next) => {
  try {
    const AttributeCategors = await AttributeCategorSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: { updatedBy: req.user.id, ...req.body },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: AttributeCategors,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getAttributeCategordetails = async (req, res, next) => {
  try {
    const AttributeCategors = await AttributeCategorSchema.findById(
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: AttributeCategors,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteAttributeCategors = async (req, res, next) => {
  try {
    const AttributeCategors = await AttributeCategorSchema.findByIdAndDelete(
      req.params.id
    );
    res.status(200).json({
      success: true,
      message: "AttributeCategors Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteAttributeCategors,
  getAttributeCategordetails,
  putAttributeCategors,
  posAttributeCategors,
  getAttributeCategors,
};
