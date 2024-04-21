const projectCategorySchema = require("../modal/ProjectCategoryModal");
const { handleError } = require("../utils/handleError");

const getprojectCategory = async (req, res, next) => {
  try {
    const projectCategory = await projectCategorySchema.find();
    res.status(200).json({
      success: true,
      data: projectCategory,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const posprojectCategory = async (req, res, next) => {
  try {
    const projectCategory = await projectCategorySchema.create(req.body);
    res.status(200).json({
      success: true,
      message: "projectCategory Created Successfully",
    });
  } catch (error) {
    
    if (error.code === 11000) {
      next(handleError(500, "projectCategory already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const putprojectCategory = async (req, res, next) => {
  try {
   
    const projectCategory = await projectCategorySchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: projectCategory,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getprojectCategorydetails = async (req, res, next) => {
  try {
    const projectCategory = await projectCategorySchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: projectCategory,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteprojectCategory = async (req, res, next) => {
  try {
    const projectCategory = await projectCategorySchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "projectCategory Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = { deleteprojectCategory, getprojectCategorydetails, putprojectCategory, posprojectCategory, getprojectCategory };
