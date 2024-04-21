const collectionFilterNewSchema = require("../modal/collectionFilterNewModal.js");
const collectionTagSchema = require("../modal/collectionTagModal.js");
const customizeDotProductSchema = require("../modal/customizeDotProductModal");
const dotProductSchema = require("../modal/dotProductModalNew");
const { handleError } = require("../utils/handleError.js");

const getAllCollectionFilters = async (req, res, next) => {
  try {
    const CollectionFilters = await collectionFilterNewSchema
      .find()
      .select("-createdBy -createdAt -updatedAt -updatedBy")
      .sort({ displaySequence: 1 })
      .populate({
        path: "collectionTagIds",
        select: "-createdBy -createdAt -updatedAt -updatedBy",
        options: { sort: { tagDisplaySequence: 1 } },
      });
    res.status(200).json({
      success: true,
      data: CollectionFilters,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const createCollectionFilters = async (req, res, next) => {
  try {
    let filterTags;
    const { tagData, filterName, ...rest } = req.body;
    /** create new collection filter */
    const collectionFilter = await collectionFilterNewSchema.create({
      createdBy: req.user.id,
      updatedBy: req.user.id,
      filterName,
      ...rest,
    });

    /** create collection tags data for inserting */
    const tagModelData = tagData.map((tag) => {
      let obj = {};
      obj.tagName = tag.tagName;
      obj.tagDisplaySequence = tag.tagDisplaySequence;
      obj.collectionFilterId = collectionFilter._id;
      obj.createdBy = req.user.id;
      obj.updatedBy = req.user.id;
      return obj;
    });

    /** insert many collection tag */
    if (collectionFilter._id) {
      filterTags = await collectionTagSchema.insertMany(tagModelData);
    }

    /** update collectionTagIds fields of collection filter */
    if (filterTags.length > 0) {
      const tagsIds = filterTags.map((tag) => tag._id);
      await collectionFilterNewSchema.findByIdAndUpdate(collectionFilter._id, {
        collectionTagIds: tagsIds,
      });
    }
    res.status(201).json({
      success: true,
      message: "Filters Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "CollectionFilters already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const updateCollectionFilters = async (req, res, next) => {
  try {
    const updateData = {
      updatedBy: req.user.id,
      ...req.body,
    };
    const CollectionFilters = await collectionFilterNewSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
      }
    );

    res.status(200).json({
      success: true,
      data: CollectionFilters,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
/** get all single /customize dot product  */
const getAllDotProducts = async (req, res, next) => {
  try {
    const dotProductFilters = await dotProductSchema.aggregate([
      {
        $match: { status: 1 },
      },
    ]);
    const resultSP = await dotProductSchema.populate(dotProductFilters, [
      {
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
    ]);
    // Perform the second query
    const customizeDotProductFilters =
      await customizeDotProductSchema.aggregate([
        {
          $match: { status: 1 },
        },
      ]);
    const resultCP = await customizeDotProductSchema.populate(
      customizeDotProductFilters,
      [
        {
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
      ]
    );
    // Merge the results
    const mergedFilters = [...resultSP, ...resultCP];
    //sort array of objects accourding to displaySequence
    mergedFilters.sort((a, b) => a.displaySequence - b.displaySequence);
    res.status(200).json({
      success: true,
      data: mergedFilters,
      message: "Dot Products Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error.message));
  }
};
const getCollectionFilterdetails = async (req, res, next) => {
  try {
    const CollectionFilters = await collectionFilterNewSchema
      .findById(req.params.id)
      .select("-createdBy -createdAt -updatedAt -updatedBy")
      .populate({
        path: "collectionTagIds",
        select: "-createdBy -createdAt -updatedAt -updatedBy",
      });
    res.status(200).json({
      success: true,
      data: CollectionFilters,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteCollectionFilters = async (req, res, next) => {
  try {
    const collectionTagIds = await collectionFilterNewSchema
      .findById(req.params.id)
      .select("collectionTagIds -_id");

    /**check collection filter name in single dot product */
    const existInDotSP = await dotProductSchema.aggregate([
      {
        $match: { Tags: { $in: collectionTagIds.collectionTagIds } },
      },
    ]);

    /**check collection filter name in customized dot product */
    const existInDotCP = await customizeDotProductSchema.aggregate([
      {
        $match: { Tags: { $in: collectionTagIds.collectionTagIds } },
      },
    ]);

    /**apply validation on collection filter name if exist in dot single/customize product  */
    if (existInDotSP?.length > 0 || existInDotCP?.length > 0) {
      res.status(409).json({
        success: false,
        message: "Filters is in use either dot single or customize product",
      });
      return;
    }
    /**delete collection filter here */
    const collectionFilter = await collectionFilterNewSchema.findByIdAndDelete(
      req.params.id
    );
    /**delete all collection tags of corresponding collectionFilterId */
    if (collectionFilter._id) {
      await collectionTagSchema.deleteMany({
        collectionFilterId: collectionFilter._id,
      });
    }
    res.status(200).json({
      success: true,
      message: "CollectionFilters Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteCollectionFilters,
  getCollectionFilterdetails,
  createCollectionFilters,
  updateCollectionFilters,
  getAllCollectionFilters,
  getAllDotProducts,
};
