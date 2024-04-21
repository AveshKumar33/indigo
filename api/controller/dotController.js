const dotSchema = require("../modal/dotModal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");

const { ObjectId } = require("mongodb");

const getdot = async (req, res, next) => {
  try {
    const dot = await dotSchema.find(req.query ? req.query : {}).populate({
      path: "dots",
      populate: {
        path: "productId",
        select:
          "-_id -__v -createdAt -updatedAt -ProductDescription -tags -SeoProductTitle  -SeoMetaDesc -SKU",
      },
    });
    res.status(200).json({
      success: true,
      data: dot,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const getDataByFilter = async (req, res, next) => {
  try {
    const { Tags } = req.body;

    const filters = {};

    for (const key in Tags) {
      if (Object.hasOwnProperty.call(Tags, key)) {
        filters[`Tags.${key}`] = {
          $in: Tags[key],
        };
      }
    }

    const dot = await dotSchema
      .find({
        ...filters,
      })
      .populate({
        path: "dots",
        populate: {
          path: "productId",
          select:
            "-_id -__v -createdAt -updatedAt -ProductDescription -tags -SeoProductTitle  -SeoMetaDesc -SKU -Tags",
        },
      });

    res.status(200).json({
      success: true,
      data: dot,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postdot = async (req, res, next) => {
  try {
    const { name, dots, Tags, ...rest } = req.body;

    const dotdata = new dotSchema({
      ...(req.file && { ProductImage: req.file.filename }),
      name,
      dots: JSON.parse(dots),
      Tags: JSON.parse(Tags),
      ...rest,
    });

    const dot = await dotdata.save();

    // const dot = await dotSchema.create(req.body);

    res.status(200).json({
      success: true,
      data: dot,
      message: "dot Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const AddImages = async (req, res, next) => {
  try {
    const { dots } = req.body;

    let fileName = "";

    if (req.file) {
      fileName = req.file.filename;
    }

    const data = await dotSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          images: {
            ProductImage: fileName,
            dots: JSON.parse(dots),
          },
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "dot Created Successfully",
      data,
    });
  } catch (error) {
    console.error(error, "check dot error");
    next(handleError(500, error.message));
  }
};

const putdot = async (req, res, next) => {
  try {
    const { name, dots, Tags = {}, ...rest } = req.body;

    const dotData = {
      name,
      dots: JSON.parse(dots),
      Tags: JSON.parse(Tags),
      ...rest,
    };

    if (req.file) {
      dotData.ProductImage = req.file.filename;
    }

    const dot = await dotSchema.findByIdAndUpdate(req.params.id, {
      $set: dotData,
    });

    if (req.file) {
      const imgpath = `images/dotimage/${dot.ProductImage}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      data: dot,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getdotdetails = async (req, res, next) => {
  try {
    const dot = await dotSchema.findById(req.params.id).populate({
      path: "dots",
      populate: {
        path: "productId",
        select:
          " -__v -createdAt -updatedAt -ProductDescription -tags -SeoProductTitle  -SeoMetaDesc -SKU",
        populate: {
          path: "attribute",
        },
        populate: {
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
      data: dot,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deletedot = async (req, res, next) => {
  try {
    const dot = await dotSchema.findByIdAndDelete(req.params.id);

    if (dot) {
      const imgpath = `images/dotimage/${dot.ProductImage}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      message: "dot Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const addDots = async (req, res, next) => {
  try {
    const { dots } = req.body;

    const dot = await dotSchema.findByIdAndUpdate(
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
      message: "Dots Added Successfully",
      data: dot,
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

const UpdatedImageDot = async (req, res, next) => {
  const { dots } = req.body;
  try {
    const data = await dotSchema.updateOne(
      { _id: req.params.id, "images._id": req.params.imageObjId },
      {
        "images.$.dots": dots,
      }
    );

    res.status(200).json({
      success: true,
      message: "Dots Update Successfully",
    });
  } catch (error) {}
};
const deleteImageObj = async (req, res, next) => {
  const { fileName } = req.body;
  try {
    await dotSchema.updateOne(
      { _id: req.params.id },
      { $pull: { images: { _id: req.params.imageObjId } } },
      {
        new: true,
      }
    );

    if (fileName) {
      const imgpath = `images/dotimage/${fileName}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }
    res.status(200).json({
      success: true,
      message: "Delete Successfully",
    });
  } catch (error) {
    console.log(error, "error deleting");
  }
};

module.exports = {
  deletedot,
  getdotdetails,
  putdot,
  postdot,
  getdot,
  addDots,
  getDataByFilter,
  AddImages,
  UpdatedImageDot,
  deleteImageObj,
};
