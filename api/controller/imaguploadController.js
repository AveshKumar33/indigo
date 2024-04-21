const imageSchema = require("../modal/imageuploadermodal");
const { handleError } = require("../utils/handleError");

const getimages = async (req, res, next) => {
  try {
    const images = await imageSchema.find();
    res.status(200).json({
      success: true,
      data: images,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postimages = async (req, res, next) => {
  try {



    let imgdata = [];


    if (req.files) {
      req.files.map((m) => imgdata.push({
        fileName: m.filename,
        filePath:m.path
      }));
    }

    const images = await imageSchema.insertMany(imgdata);

    res.status(200).json({
      success: true,
      message: "images Created Successfully",
      data: images,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getimagedetails = async (req, res, next) => {
  try {
    const images = await imageSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: images,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteimages = async (req, res, next) => {
  try {
    const images = await imageSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "images Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = { deleteimages, getimagedetails, postimages, getimages };
