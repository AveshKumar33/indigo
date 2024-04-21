const collectionTagSchema = require("../modal/collectionTagModal.js");
const collectionFilterNewSchema = require("../modal/collectionFilterNewModal.js");
const customizeDotProductSchema = require("../modal/customizeDotProductModal");
const dotProductSchema = require("../modal/dotProductModalNew");
const { handleError } = require("../utils/handleError.js");
const mongoose = require("mongoose");
const getAllCollectionTag = async (req, res, next) => {
  try {
    const CollectionTags = await collectionTagSchema.find();
    res.status(200).json({
      success: true,
      data: CollectionTags,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const createCollectionTag = async (req, res, next) => {
  try {
    const collectionTag = await collectionTagSchema.create({
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });
    /**at the time create tag tag id push in to collectionTagIds of collectionFilter model */
    if (collectionTag._id) {
      await collectionFilterNewSchema.findByIdAndUpdate(
        collectionTag.collectionFilterId,
        { $push: { collectionTagIds: collectionTag._id } }
      );
    }
    res.status(201).json({
      success: true,
      data: collectionTag,
      message: "Collection Tag  Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "Collection Tags already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const updateCollectionTag = async (req, res, next) => {
  try {
    const updateData = {
      updatedBy: req.user.id,
      ...req.body,
    };
    const CollectionTags = await collectionTagSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
      }
    );

    res.status(200).json({
      success: true,
      data: CollectionTags,
      message: "Collection Tag Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getCollectionTagdetails = async (req, res, next) => {
  try {
    const CollectionTags = await collectionTagSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: CollectionTags,
      message: "Collection Tag Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteCollectionTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    /**check collection tag name in single dot product */
    const existInDotSP = await dotProductSchema.find({
      Tags: { $in: new mongoose.Types.ObjectId(id) },
    });
    /**check collection tag name in customized dot product */
    const existInDotCP = await customizeDotProductSchema.find({
      Tags: { $in: new mongoose.Types.ObjectId(id) },
    });

    /**apply validation on collection  tag if exist in dot single/customize product  */
    if (existInDotSP?.length > 0 || existInDotCP?.length > 0) {
      res.status(409).json({
        success: false,
        message: "Tags is in use either dot single or customize product",
      });
      return;
    }
    const collectionTag = await collectionTagSchema.findByIdAndDelete(
      req.params.id
    );
    /** deleted tag id remove from collectionTagIds array in collection filter model */
    if (collectionTag._id) {
      await collectionFilterNewSchema.findByIdAndUpdate(
        collectionTag.collectionFilterId,
        { $pull: { collectionTagIds: collectionTag._id } }
      );
    }
    res.status(200).json({
      success: true,
      message: "Collection Tag Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteCollectionTag,
  getCollectionTagdetails,
  createCollectionTag,
  updateCollectionTag,
  getAllCollectionTag,
};
