const reviewSchema = require("../modal/review");
const { handleError } = require("../utils/handleError");
const fs = require("fs");

const getreview = async (req, res, next) => {
  try {
    const review = await reviewSchema
      .find(req.query ? req.query : {})
      // .populate("Product")
      .populate("UserDetails");
    res.status(200).json({
      success: true,
      data: review,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getReviewByProduct = async (req, res, next) => {
  try {
    const model = req.query.model;
    let query = {};
    if (model !== undefined && model !== "") {
      query[model] = req.params.id;
    }
    const review = await reviewSchema.find(query);
    res.status(200).json({
      success: true,
      data: review,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const getReviewByProducttotalRating = async (req, res, next) => {
  const model = req.query.model;
  let query = {};
  if (model !== undefined && model !== "") {
    query[model] = req.params.id;
  }
  try {
    const review = await reviewSchema.find(query);
    const ratingData = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    const totalRating = review.reduce((acc, cur) => {
      ratingData[cur.Rating] = ratingData[cur.Rating] + 1;
      return Number(acc) + parseInt(cur.Rating);
    }, 0);
    res.status(200).json({
      success: true,
      data: {
        totalUser: review.length,
        totalRating: totalRating ?? 0,
        ratingData,
      },
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postreview = async (req, res, next) => {
  try {
    const { Name, Email, ...rest } = req.body;
    const reviewImage = req.file.filename;

    const reviewdata = new reviewSchema({
      Name,
      Email,
      ...rest,
      ReviewPicture: reviewImage,
    });

    const review = await reviewdata.save();

    // const review = await reviewSchema.create(req.body);

    res.status(200).json({
      success: true,
      data: review,
      message: "review Created Successfully",
    });
  } catch (error) {
    console.log(error, "check error: ");
    next(handleError(500, error.message));
  }
};

const putreview = async (req, res, next) => {
  try {
    const {
      Name,
      Email,
      Rating,
      ReviewTitle,
      ReviewBody,
      // Product,
      UserDetails,
    } = req.body;

    const reviewData = {
      Name,
      Email,
      Rating,
      ReviewTitle,
      ReviewBody,
      // Product,
      UserDetails,
    };

    if (req.file) {
      reviewData.ReviewPicture = req.file.filename;
    }

    const review = await reviewSchema.findByIdAndUpdate(req.params.id, {
      $set: reviewData,
    });

    if (review.ReviewPicture) {
      const imgpath = `images/review/${review.ReviewPicture}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      data: review,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getreviewdetails = async (req, res, next) => {
  try {
    const review = await reviewSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: review,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deletereview = async (req, res, next) => {
  try {
    const review = await reviewSchema.findByIdAndDelete(req.params.id);

    if (review) {
      const imgpath = `images/review/${review.ReviewPicture}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      message: "review Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const genrateImageThroughApi = async () => {
  try {
  } catch (error) {}
};

module.exports = {
  deletereview,
  getreviewdetails,
  putreview,
  postreview,
  getreview,
  getReviewByProduct,
  getReviewByProducttotalRating,
};
