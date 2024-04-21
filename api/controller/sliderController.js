const sliderSchema = require("../modal/sliderModal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");

const getImges = async (req, res, next) => {
  try {
    const images = await sliderSchema.find(req.query ? req.query : {});

    res.status(200).json({
      success: true,
      data: images,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const addImage = async (req, res, next) => {
  try {
    if (req.file) {
      const slider = await sliderSchema.create({
        // ImageName:req.file.filename,
        ...(req.file && { ImageName: req.file.filename }),
        SideImage: req.body.SideImage,
      });

      res.status(200).json({
        success: true,
        data: slider,
        message: "Image Added Successfully",
      });
    } else {
      next(handleError(500, "Image Required"));
    }
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const image = await sliderSchema.findByIdAndDelete(req.params.id);

    const imgpath = `images/slider/${image.ImageName}`;
    if (fs.existsSync(imgpath)) {
      fs.unlinkSync(imgpath);
    }

    res.status(200).json({
      success: true,
      message: "Image Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = { getImges, addImage, deleteImage };
