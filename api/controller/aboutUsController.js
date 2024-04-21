const aboutUsSchema = require("../modal/aboutusModal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");
const getAllAboutUs = async (req, res, next) => {
  try {
    const aboutUs = await aboutUsSchema.find();
    res.status(200).json({
      success: true,
      data: aboutUs,
      message: "AboutUs fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postAboutUs = async (req, res, next) => {
  try {
    let imgdata = [];

    if (req.files) {
      req?.files?.map((m) => imgdata.push(m.filename));
    }

    const aboutUs = await aboutUsSchema.create({
      aboutUsImages: imgdata,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });

    res.status(200).json({
      success: true,
      data: aboutUs,
      message: "AboutUs Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(handleError(500, "Same AboutUs Already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const putAboutUs = async (req, res, next) => {
  const { title, description, status } = req.body;

  try {
    let imgdata = [];
    if (req.files) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    let newaboutUsData = {
      updatedBy: req.user.id,
      title,
      description,
      status,
    };

    const updatedData = {};
    if (imgdata?.length !== 0) {
      updatedData.$push = { aboutUsImages: imgdata };
      updatedData.$set = newaboutUsData;
    } else {
      updatedData.$set = newaboutUsData;
    }

    const aboutUs = await aboutUsSchema.findByIdAndUpdate(
      req.params.id,
      updatedData
    );

    res.status(200).json({
      success: true,
      data: aboutUs,
      message: "AboutUs Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const deleteImage = async (req, res, next) => {
  try {
    const { id, name } = req.params;

    const aboutUs = await aboutUsSchema.findByIdAndUpdate(id, {
      $pull: { aboutUsImages: name },
    });

    const deleteimgpath = `images/aboutUs/${name}`;

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
      data: aboutUs,
      message: "aboutUs Image Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getAboutUsDetails = async (req, res, next) => {
  try {
    const aboutUs = await aboutUsSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: aboutUs,
      message: "Experience Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteAboutUs = async (req, res, next) => {
  try {
    const aboutUs = await aboutUsSchema.findByIdAndDelete(req.params.id);

    aboutUs.aboutUsImages.map((p, i) => {
      const imgPath = `images/aboutUs/${p}`;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    res.status(200).json({
      success: true,
      message: "AboutUs Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteAboutUs,
  getAboutUsDetails,
  putAboutUs,
  postAboutUs,
  getAllAboutUs,
  deleteImage,
};
