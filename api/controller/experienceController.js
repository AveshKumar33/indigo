const experienceSchema = require("../modal/experienceModal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");
const getAllExperience = async (req, res, next) => {
  try {
    const experience = await experienceSchema.find();
    res.status(200).json({
      success: true,
      data: experience,
      message: "Experience fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postExperience = async (req, res, next) => {
  try {
    let imgdata = [];

    if (req.files) {
      req?.files?.map((m) => imgdata.push(m.filename));
    }

    const experience = await experienceSchema.create({
      experienceImages: imgdata,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });

    res.status(200).json({
      success: true,
      data: experience,
      message: "Experience Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(handleError(500, "Same Experience Already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const putExperience = async (req, res, next) => {
  const { name, description, status } = req.body;

  try {
    let imgdata = [];
    if (req.files) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    let newExperienceData = {
      updatedBy: req.user.id,
      name,
      description,
      status,
    };

    const updatedData = {};
    if (imgdata?.length !== 0) {
      updatedData.$push = { experienceImages: imgdata };
      updatedData.$set = newExperienceData;
    } else {
      updatedData.$set = newExperienceData;
    }

    const experience = await experienceSchema.findByIdAndUpdate(
      req.params.id,
      updatedData
    );

    res.status(200).json({
      success: true,
      data: experience,
      message: "Experience Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const deleteImage = async (req, res, next) => {
  try {
    const { id, name } = req.params;

    const experience = await experienceSchema.findByIdAndUpdate(id, {
      $pull: { experienceImages: name },
    });

    const deleteimgpath = `images/experience/${name}`;
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
      data: experience,
      message: "Experience Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getExperienceDetails = async (req, res, next) => {
  try {
    const experience = await experienceSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: experience,
      message: "Experience Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteExperience = async (req, res, next) => {
  try {
    const experience = await experienceSchema.findByIdAndDelete(req.params.id);

    experience.experienceImages.map((p, i) => {
      const imgPath = `images/experience/${p}`;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    res.status(200).json({
      success: true,
      message: "Experience Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteExperience,
  getExperienceDetails,
  putExperience,
  postExperience,
  getAllExperience,
  deleteImage,
};
