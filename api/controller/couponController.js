const couponSchema = require("../modal/coupon");
const { handleError } = require("../utils/handleError");

const getcoupons = async (req, res, next) => {
  try {
    const coupons = await couponSchema.find(req.query ? req.query : {});
    res.status(200).json({
      success: true,
      data: coupons,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postcoupons = async (req, res, next) => {
  try {
    const coupons = await couponSchema.create({
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });
    res.status(200).json({
      success: true,
      data: coupons,
      message: "coupons Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(handleError(500, "Same Coupon Name Already Present"));
    } else {
      next(handleError(500, error.message));
    }

    // next(handleError(500, error.message));
  }
};

const putcoupons = async (req, res, next) => {
  try {
    const coupons = await couponSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          updatedBy: req.user.id,
          ...req.body,
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: coupons,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getcouponsdetails = async (req, res, next) => {
  try {
    const coupons = await couponSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: coupons,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deletecoupons = async (req, res, next) => {
  try {
    const coupons = await couponSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "coupons Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deletecoupons,
  getcouponsdetails,
  putcoupons,
  postcoupons,
  getcoupons,
};
