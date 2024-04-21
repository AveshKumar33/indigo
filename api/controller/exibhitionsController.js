const exibhitionsSchema = require("../modal/exibhitionsModal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");
const getAllExibhitions = async (req, res, next) => {
  try {
    const exibhitions = await exibhitionsSchema.find();
    res.status(200).json({
      success: true,
      data: exibhitions,
      message: "Exibhitions fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postExibhitions = async (req, res, next) => {
  try {
    let imgdata = [];

    if (req.files) {
      req?.files?.map((m) => imgdata.push(m.filename));
    }

    const exibhitions = await exibhitionsSchema.create({
      exibhitionsImages: imgdata,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });

    res.status(200).json({
      success: true,
      data: exibhitions,
      message: "Exibhitions Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(handleError(500, "Same AboutUs Already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const putExibhitions = async (req, res, next) => {
  const { title, description, status } = req.body;

  try {
    let imgdata = [];
    if (req.files) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    let newExibhitionsData = {
      updatedBy: req.user.id,
      title,
      description,
      status,
    };

    const updatedData = {};
    if (imgdata?.length !== 0) {
      updatedData.$push = { exibhitionsImages: imgdata };
      updatedData.$set = newExibhitionsData;
    } else {
      updatedData.$set = newExibhitionsData;
    }

    const exibhitions = await exibhitionsSchema.findByIdAndUpdate(
      req.params.id,
      updatedData
    );

    res.status(200).json({
      success: true,
      data: exibhitions,
      message: "Exibhitions Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const deleteImage = async (req, res, next) => {
  try {
    const { id, name } = req.params;

    const exibhitions = await exibhitionsSchema.findByIdAndUpdate(id, {
      $pull: { exibhitionsImages: name },
    });

    const deleteimgpath = `images/exibhitions/${name}`;

    fs.unlinkSync(deleteimgpath, (err) => {
      if (!err) {
        return res.status(200).json({
          success: true,
          message: "Image Deleted Successfully",
        });
      }
    });

    res.status(200).json({
      success: true,
      data: exibhitions,
      message: "Exibhitions Image Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getExibhitionsDetails = async (req, res, next) => {
  try {
    const exibhitions = await exibhitionsSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: exibhitions,
      message: "Exibhitions Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteExibhitions = async (req, res, next) => {
  try {
    const exibhitions = await exibhitionsSchema.findByIdAndDelete(
      req.params.id
    );

    exibhitions.exibhitionsImages.map((p, i) => {
      const imgPath = `images/exibhitions/${p}`;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    res.status(200).json({
      success: true,
      message: "Exibhitions Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteExibhitions,
  getExibhitionsDetails,
  putExibhitions,
  postExibhitions,
  getAllExibhitions,
  deleteImage,
};
