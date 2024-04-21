const dotCustomizedSchema = require("../modal/dotCustomizedModal");
const dotProductSchema = require("../modal/dotProductModalNew");
const { handleError } = require("../utils/handleError");
const { ObjectId } = require("mongodb");
const fs = require("fs");

const getdotCustomized = async (req, res, next) => {
  try {
    const dotCustomized = await dotCustomizedSchema
      .find(req.query ? req.query : {})
      .populate({
        path: "dots",
        populate: {
          path: "productId",
          select:
            "-_id -__v -createdAt -updatedAt -ProductDescription -tags -SeoProductTitle  -SeoMetaDesc -SKU",
          populate: {
            path: "attribute",
            path: "FrontAttribute",
            populate: {
              path: "OptionsValue.AttributeCategory",
              select: {
                Name: 1,
              },
            },
          },
        },
      });

    res.status(200).json({
      success: true,
      data: dotCustomized,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postdotCustomized = async (req, res, next) => {
  try {
    const { name, dots } = req.body;

    const dotCustomizeddata = new dotCustomizedSchema({
      ...(req.file && { ProductImage: req.file.filename }),
      name,
      dots: JSON.parse(dots),
    });

    const dotCustomized = await dotCustomizeddata.save();

    // const dot = await dotCustomizedSchema.create(req.body);

    res.status(200).json({
      success: true,
      data: dotCustomized,
      message: "dotCustomized Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const putdotCustomized = async (req, res, next) => {
  try {
    const { name, dots } = req.body;

    const dotCustomizedData = {
      name,
      dots: JSON.parse(dots),
    };

    if (req.file) {
      dotCustomizedData.ProductImage = req.file.filename;
    }

    const dotCustomized = await dotCustomizedSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: dotCustomizedData,
      }
    );

    if (req.file) {
      const imgpath = `images/dotCustomizedimage/${dotCustomized.ProductImage}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      data: dotCustomized,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getdotCustomizeddetails = async (req, res, next) => {
  try {
    const dotCustomized = await dotCustomizedSchema
      .findById(req.params.id)
      .populate({
        path: "dots",
        populate: {
          path: "productId",
          select:
            " -__v -createdAt -updatedAt -ProductDescription -SeoProductTitle  -SeoMetaDesc -SKU",
          populate: [
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
              populate: {
                path: "OptionsValue.AttributeCategory",
                select: {
                  Name: 1,
                },
              },
            },
            {
              path: "BackCB",
              populate: {
                path: "OptionsValue.AttributeCategory",
                select: {
                  Name: 1,
                },
              },
            },
            {
              path: "BackIB",
              populate: {
                path: "OptionsValue.AttributeCategory",
                select: {
                  Name: 1,
                },
              },
            },
            {
              path: "FrontAttribute",
              populate: {
                path: "OptionsValue.AttributeCategory",
                select: {
                  Name: 1,
                },
              },
            },
          ],
        },
        // populate:{
        //   path:"BackSAF",
        //   populate:{
        //     path: "BackSAF"
        //   },
        // },
      });

    res.status(200).json({
      success: true,
      data: dotCustomized,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deletedotCustomized = async (req, res, next) => {
  try {
    const dotCustomized = await dotCustomizedSchema.findByIdAndDelete(
      req.params.id
    );

    if (dotCustomized) {
      const imgpath = `images/dotCustomizedimage/${dotCustomized.ProductImage}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      message: "dotCustomized Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const adddotCustomized = async (req, res, next) => {
  try {
    const { dots } = req.body;

    const dotCustomized = await dotCustomizedSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          dots: dots,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "dotCustomized Added Successfully",
      data: dotCustomized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removedots = async (req, res, next) => {
  try {
  } catch (error) {}
};

module.exports = {
  deletedotCustomized,
  getdotCustomized,
  postdotCustomized,
  putdotCustomized,
  adddotCustomized,
  getdotCustomizeddetails,
};
