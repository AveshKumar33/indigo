const tagSchema = require("../modal/tagsmodal");
const customizedProductSchema = require("../modal/customizeProductModel");
const singleProductSchema = require("../modal/singleProductModal");

const { handleError } = require("../utils/handleError");

const gettags = async (req, res, next) => {
  try {
    const tags = await tagSchema.find();
    res.status(200).json({
      success: true,
      data: tags,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postags = async (req, res, next) => {
  try {
    const tags = await tagSchema.create({
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });
    res.status(200).json({
      success: true,
      message: "Tags Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "Tags already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const puttags = async (req, res, next) => {
  try {
    const tags = await tagSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: { updatedBy: req.user.id, ...req.body },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: tags,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const gettagdetails = async (req, res, next) => {
  try {
    const tags = await tagSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: tags,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deletetags = async (req, res, next) => {
  try {
    /** if tag is exist inside single product */
    const tagInSingleProduct = await singleProductSchema.find({
      tags: req.params.id,
    });

    /** if tag is exist inside customized product */
    const tagInCustomizeProduct = await customizedProductSchema.find({
      tags: req.params.id,
    });
    // .select("ProductName tags");

    /**  validation of tag   */
    if (tagInSingleProduct?.length > 0 || tagInCustomizeProduct?.length > 0) {
      res.status(409).json({
        success: true,
        message: " Tag is used in product",
      });
      return;
    }
    await tagSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Tags Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = { deletetags, gettagdetails, puttags, postags, gettags };
