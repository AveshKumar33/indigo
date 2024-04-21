const ProductDescriptionSchema = require("../modal/ProductDescriptionsmodal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");
const getProductDescriptions = async (req, res, next) => {
  try {
    const ProductDescriptions = await ProductDescriptionSchema.find({
      Product: req.params.id,
    });
    res.status(200).json({
      success: true,
      data: ProductDescriptions,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const posProductDescriptions = async (req, res, next) => {
  try {
    let imgdata = [];

    if (req.files) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    const { Title, Descriptions, Product } = req.body;

    const ProductDescriptions = await ProductDescriptionSchema.create({
      Picture: imgdata,
      Title,
      Descriptions,
      Product,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });
    res.status(200).json({
      success: true,
      message: "ProductDescriptions Created Successfully",
      data: ProductDescriptions,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const putProductDescriptions = async (req, res, next) => {
  try {
    let imgdata = [];

    if (req.files) {
      req.files.map((m) => imgdata.push(m.filename));
    }
    const { Title, Descriptions, Product } = req.body;

    const ProductDescriptions = await ProductDescriptionSchema.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          Title,
          Descriptions,
          Product,
          updatedBy: req.user.id,
        },
        $push: {
          Picture: { $each: imgdata },
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: ProductDescriptions,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getProductDescriptiondetails = async (req, res, next) => {
  try {
    const ProductDescriptions = await ProductDescriptionSchema.findById(
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: ProductDescriptions,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteProductDescriptions = async (req, res, next) => {
  try {
    const product = await ProductDescriptionSchema.findByIdAndDelete(
      req.params.id
    );

    product.Picture.map((p, i) => {
      const imgPath = `images/product/${p}`;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });
    res.status(200).json({
      success: true,
      message: "ProductDescriptions Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const removeImage = async (req, res) => {
  try {
    await ProductDescriptionSchema.findByIdAndUpdate(req.params.id, {
      $pull: { Picture: req.params.name },
    });

    //  Image delete fromthe Server
    const deleteimgpath = `images/product/${req.params.name}`;
    fs.unlinkSync(deleteimgpath, (err) => {
      if (err) {
        return res.status(200).json({
          success: true,
          message: "Image Deleted Successfully",
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Image Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  deleteProductDescriptions,
  getProductDescriptiondetails,
  putProductDescriptions,
  posProductDescriptions,
  getProductDescriptions,
  removeImage,
};
