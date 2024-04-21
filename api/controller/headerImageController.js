const headerImageModalSchema = require("../modal/headerImageModal");
const collectionSchema = require("../modal/collection");
const { handleError } = require("../utils/handleError");
const fs = require("fs");
const { ObjectId } = require("mongodb");

/** get all Parameter Position Image   */
const getAllHeaderImage = async (req, res, next) => {
  try {
    const headerImage = await headerImageModalSchema
      .find({ isRoot: true })
      .populate("collectionId", { title: 1, rootPath: 1 });

    let childCollections;

    if (headerImage?.length > 0) {
      const allChild = headerImage
        ?.filter((collection) => collection?.collectionId?._id)
        .map((collection) => collection?.collectionId?._id);

      childCollections = await collectionSchema.aggregate([
        {
          $match: { rootPath: { $in: allChild } },
        },
        { $unwind: "$rootPath" },
        {
          $group: {
            _id: "$rootPath",
            count: { $sum: 1 },
          },
        },
      ]);
    }

    let rootChildCount = {};

    for (let childCollection of childCollections) {
      rootChildCount[childCollection?._id] = childCollection?.count;
    }

    res.status(200).json({
      success: true,
      data: headerImage,
      childCollections: rootChildCount,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getChildHeaderImage = async (req, res, next) => {
  try {
    const headerImage = await headerImageModalSchema
      .find({ rootPath: { $in: req.params.rootCollectionId } })
      .populate("collectionId", { title: 1, rootPath: 1 });

    let childCollections;

    if (headerImage?.length > 0) {
      const allChild = headerImage
        ?.filter((collection) => collection?.collectionId?._id)
        .map((collection) => collection?.collectionId?._id);

      childCollections = await collectionSchema.aggregate([
        {
          $match: { rootPath: { $in: allChild } },
        },
        { $unwind: "$rootPath" },
        {
          $group: {
            _id: "$rootPath",
            count: { $sum: 1 },
          },
        },
      ]);
    }

    let rootChildCount = {};

    for (let childCollection of childCollections) {
      rootChildCount[childCollection?._id] = childCollection?.count;
    }

    res.status(200).json({
      success: true,
      data: headerImage,
      childCollections: rootChildCount,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getHeaderImageByTitle = async (req, res, next) => {
  try {
    const headerImage = await headerImageModalSchema
      .findOne({ title: req.params.title })
      .populate("collectionId", { title: 1, rootPath: 1 });

    res.status(200).json({
      success: true,
      data: headerImage,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** create parameter Position Image */
const createHeaderImage = async (req, res, next) => {
  try {
    const { collectionId = "" } = req.body;
    const pngImage = req.file.filename;

    const headerImageData = new headerImageModalSchema({
      collectionId,
      pngImage,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });
    await headerImageData.save();

    res.status(200).json({
      success: true,
      message: "parameter Position Image Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "Position already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

/** update parameter Position Image */
const updateHeaderImageById = async (req, res, next) => {
  try {
    const headerImageData = {
      updatedBy: req.user.id,
    };

    if (req.file) {
      headerImageData.pngImage = req.file.filename;
    }

    const updatedHeaderImage = await headerImageModalSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: headerImageData,
      }
    );

    if (req.file && updatedHeaderImage.pngImage !== "headerDefaultImage.jpg") {
      try {
        const imgPath = `images/header/${updatedHeaderImage.pngImage}`;
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      } catch (err) {
        console.log("error is coming ", err);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedHeaderImage,
      message: "Header Image Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  getAllHeaderImage,
  getChildHeaderImage,
  updateHeaderImageById,
  getHeaderImageByTitle,
};
