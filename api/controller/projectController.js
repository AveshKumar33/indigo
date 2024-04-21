const projectSchema = require("../modal/projectModal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");

// //Create middleware to upload image and Video

// const imageStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images/project"); // Define the directory where images will be saved
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname); // Define how images will be named
//   },
// });

// const videoStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "video/project/"); // Define the directory where videos will be saved
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname); // Define how videos will be named
//   },
// });

// const imageUpload = multer({ storage: imageStorage }).array("images"); // Change to .array() for multiple files
// const videoUpload = multer({ storage: videoStorage }).single("video");

const getproject = async (req, res) => {
  try {
    const product = await projectSchema
      .find(req.query ? req.query : {})
      .populate("ProjectCategory")
      .populate("singleProducts")
      .populate("dotSingleProduct")
      .populate("customizedProduct")
      .populate("customizeDotProduct");

    res.status(200).json({
      success: true,
      message: "All Project Data Fetched",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const postproject = async (req, res, next) => {
  try {
    let imgdata = [];
    // if (req.files && req.files["projectimg"]) {
    //   req.files["projectimg"].map((m) => imgdata.push(m.path));
    // }
    if (req.files) {
      req?.files?.map((m) => imgdata.push(m.filename));
    }

    let {
      ProjectName,
      ProjectDescription,
      ProjectImage,
      ProjectCategory,
      singleProducts,
      dotSingleProduct,
      customizedProduct,
      customizeDotProduct,
      video,
    } = req.body;

    const projectdata = new projectSchema({
      ...(req.files["projectvideo"] &&
        req.files["projectvideo"][0].path !== undefined && {
          ProjectVideo: req.files["projectvideo"][0].path,
        }),
      ProjectName,
      ProjectDescription,
      ProjectImage: imgdata,
      ProjectCategory,
      video,
      singleProducts: JSON.parse(singleProducts),
      dotSingleProduct: JSON.parse(dotSingleProduct),
      customizedProduct: JSON.parse(customizedProduct),
      customizeDotProduct: JSON.parse(customizeDotProduct),
    });

    const project = await projectdata.save();

    res.status(200).json({
      success: true,
      data: project,
      message: "project Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const putproject = async (req, res, next) => {
  try {
    let imgdata = [];
    // if (req.files && req.files["projectimg"]) {
    //   req.files["projectimg"].map((m) => imgdata.push(m.path));
    // }
    if (req.files || req.file) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    let {
      ProjectName,
      ProjectDescription,
      ProjectCategory,
      singleProducts,
      dotSingleProduct,
      customizedProduct,
      customizeDotProduct,
      video,
    } = req.body;

    const projectdata = {
      ProjectName,
      ProjectDescription,
      ProjectCategory,
      video,
      singleProducts: JSON.parse(singleProducts),
      dotSingleProduct: JSON.parse(dotSingleProduct),
      customizedProduct: JSON.parse(customizedProduct),
      customizeDotProduct: JSON.parse(customizeDotProduct),
    };

    if (
      req.files["projectvideo"] &&
      req.files["projectvideo"][0].path !== undefined
    ) {
      projectdata.ProjectVideo = req.files["projectvideo"][0].path;
    }

    const updateOperation = {};
    if (imgdata?.length !== 0) {
      updateOperation.$push = { ProjectImage: imgdata };
      updateOperation.$set = projectdata;
    } else {
      updateOperation.$set = projectdata;
    }

    const project = await projectSchema
      .findByIdAndUpdate(req.params.id, updateOperation, { new: true })
      .populate("ProjectCategory")
      .populate("singleProducts")
      .populate("dotSingleProduct")
      .populate("customizedProduct")
      .populate("customizeDotProduct");

    res.status(200).json({
      success: true,
      data: project,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getprojectdetails = async (req, res, next) => {
  try {
    const project = await projectSchema
      .findById(req.params.id)
      .populate("ProjectCategory")
      .populate({
        path: "singleProducts",
        populate: {
          path: "Collection",
        },
      })
      .populate({ path: "customizedProduct", populate: { path: "Collection" } })
      .populate({
        path: "dotSingleProduct",
        populate: {
          path: "dotProductImageIds",
          populate: {
            path: "dots.productId",
            select: "ProductName Urlhandle Collection",
            populate: {
              path: "Collection",
              select: "title url",
            },
          },
          select: "-createdAt -updatedAt -createdBy -updatedBy ",
        },
      })
      .populate({
        path: "customizeDotProduct",
        populate: {
          path: "dotProductImageIds",
          populate: {
            path: "dots.productId",
            select: "ProductName Urlhandle Collection",
            populate: {
              path: "Collection",
              select: "title url",
            },
          },
          select: "-createdAt -updatedAt -createdBy -updatedBy ",
        },
      });

    res.status(200).json({
      success: true,
      data: project,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteproject = async (req, res, next) => {
  try {
    const project = await projectSchema.findByIdAndDelete(req.params.id);

    project.ProjectImage.map((p, i) => {
      const imgPath = `${p}`;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    if (project.ProjectVideo) {
      if (fs.existsSync(project.ProjectVideo)) {
        fs.unlinkSync(project.ProjectVideo);
      }
    }

    res.status(200).json({
      success: true,
      message: "project Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const removeImage = async (req, res) => {
  try {
    const { imagename } = req.body;

    await projectSchema
      .findByIdAndUpdate(req.params.id, {
        $pull: { ProjectImage: imagename },
      })
      .populate("ProjectCategory")
      .populate("singleProducts")
      .populate("dotSingleProduct")
      .populate("customizedProduct")
      .populate("customizeDotProduct");
    //  Image delete fromthe Server
    const deleteimgpath = `images/project/${imagename}`;
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
  deleteproject,
  getprojectdetails,
  putproject,
  postproject,
  getproject,
  removeImage,
};
