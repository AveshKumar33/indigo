const CollectionFilterSchema = require("../modal/CollectionFiltersmodal.js");
const { handleError } = require("../utils/handleError.js");
const customizeDotProductSchema = require("../modal/customizeDotProductModal");
const dotProductSchema = require("../modal/dotProductModalNew");
const mongoose = require("mongoose");

const getCollectionFilters = async (req, res, next) => {
  try {
    const CollectionFilters = await CollectionFilterSchema.find();
    res.status(200).json({
      success: true,
      data: CollectionFilters,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const posCollectionFilters = async (req, res, next) => {
  try {
    const CollectionFilters = await CollectionFilterSchema.create(req.body);
    res.status(200).json({
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
const AddTagCollectionFilters = async (req, res, next) => {
  const { Name } = req.body;

  try {
    await CollectionFilterSchema.findByIdAndUpdate(req.params.id, {
      $addToSet: { Filter: Name },
    });
    res.status(200).json({
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

const putCollectionFilters = async (req, res, next) => {
  try {
    const CollectionFilters = await CollectionFilterSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
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

const getCollectionFilterdetails = async (req, res, next) => {
  try {
    const CollectionFilters = await CollectionFilterSchema.findById(
      req.params.id
    );
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
    /**find collection filter name from database */
    const CollectionFilters = await CollectionFilterSchema.findById(
      req.params.id
    ).select("Name -_id");

    /**check collection filter name in single dot product */
    const existInDotSP = await dotProductSchema.aggregate([
      {
        $match: {
          [`Tags.${CollectionFilters.Name}`]: { $exists: true },
        },
      },
    ]);
    /**check collection filter name in customized dot product */
    const existInDotCP = await customizeDotProductSchema.aggregate([
      {
        $match: {
          [`Tags.${CollectionFilters.Name}`]: { $exists: true },
        },
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
    await CollectionFilterSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "CollectionFilters Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** single /customize dot product filter search by collection filter */
const getCollectionFilterdetailsFromProduct = async (req, res, next) => {
  try {
    const { filter, limit, page } = req.query;
    const limits = Number(limit);
    const pages = Number(page);
    const Tags = JSON.parse(filter);

    let query = {status: 1};

    if (Tags?.length > 0) {
      let tagIds = Tags.map((tag) => new mongoose.Types.ObjectId(tag));
      query.Tags = { $in: tagIds };
    }

    const dotProductFiltersPipeline = [
      {
        $sort: { displaySequence: 1, _id: 1 }
      },
      {
        $match: query,
      },
         {
        $skip: (pages - 1) * limits,
      },
      {
        $limit: limits,
      },
    ];

    const [dotProductFilters, customizeDotProductFilters] = await Promise.all([
      dotProductSchema.aggregate(dotProductFiltersPipeline),
      customizeDotProductSchema.aggregate(dotProductFiltersPipeline)
    ]);
    

    // const dotProductFilters = await dotProductSchema.aggregate([
    //   {
    //     $match: query,
    //   },
    //   {
    //     $match: { status: 1 },
    //   },
    //   {
    //     $sort: { displaySequence: 1 },
    //   },
    //   {
    //     $skip: (pages - 1) * limits,
    //   },
    //   {
    //     $limit: limits,
    //   },
    // ]);

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
    // const customizeDotProductFilters =
    //   await customizeDotProductSchema.aggregate([
    //     {
    //       $match: query,
    //     },
    //     {
    //       $match: { status: 1 },
    //     },
    //     {
    //       $sort: { displaySequence: 1 },
    //     },
    //     {
    //       $skip: (pages - 1) * limits,
    //     },
    //     {
    //       $limit: limits,
    //     },
    //   ]);

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
    const mergedFilters = [  ...resultSP,...resultCP];

    //sort array of objects according to displaySequence

    mergedFilters.sort((a, b) => a.displaySequence - b.displaySequence);
    res.status(200).json({
      success: true,
      data: mergedFilters,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteCollectionFilters,
  getCollectionFilterdetails,
  putCollectionFilters,
  getCollectionFilterdetailsFromProduct,
  posCollectionFilters,
  getCollectionFilters,
  AddTagCollectionFilters,
};
