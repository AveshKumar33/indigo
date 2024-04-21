const wishlistSchema = require("../modal/wishlistModel");
const { ObjectId } = require("mongodb");
const { handleError } = require("../utils/handleError");

// using to add product from wishlist
const addProductsToWishlist = async (req, res, next) => {
  try {
    const products = req.body;
    const userId = req.user.id;

    const productsWithoutId = products.map((product) => {
      const { _id, ...rest } = product;
      return { ...rest, userId };
    });

    await wishlistSchema.insertMany(productsWithoutId);

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error.message));
  }
};

const addWishlist = async (req, res, next) => {
  try {
    const wishlistData = await new wishlistSchema({
      ...req.body,
      userId: req.user.id,
    });

    await wishlistData.save();
    res.status(201).json({
      success: true,
      data: wishlistData,
      message: "Added to wishlist",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const wishlistData = await wishlistSchema.aggregate([
      {
        $match: { userId: new ObjectId(req.user.id) },
      },
      {
        $sort: { createdAt: 1 },
      },
    ]);

    const data = await wishlistSchema.populate(wishlistData, [
      { path: "singleProductId" },
      { path: "singleProductCombinationId" },
      { path: "singleProductCombinations.attributeId" },
      { path: "singleProductCombinations.parameterId" },
    ]);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// for product list purposes
const getWishlistProduct = async (req, res, next) => {
  try {
    const wishlistData = await wishlistSchema.aggregate([
      {
        $match: { userId: new ObjectId(req.user.id) },
      },
      {
        $sort: { createdAt: 1 },
      },
    ]);

    res.status(201).json({
      success: true,
      data: wishlistData,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// for product list purposes
const getWishlistProductById = async (req, res, next) => {
  try {
    const wishlistData = await wishlistSchema.aggregate([
      {
        $match: {
          userId: new ObjectId(req.user.id),
          singleProductId: new ObjectId(req.params.id),
        },
      },
      {
        $sort: { createdAt: 1 },
      },
    ]);

    res.status(201).json({
      success: true,
      data: wishlistData,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const wishlistProductCount = async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user.id);
    const count = await wishlistSchema.aggregate([
      {
        $match: { userId: userId },
      },
      {
        $count: "wishlistCount",
      },
    ]);

    // Extracting the count from the result
    const wishlistCount = count.length > 0 ? count[0].wishlistCount : 0;

    res.status(200).json({
      success: true,
      data: wishlistCount,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// for product list purposes
const removeWishlistProduct = async (req, res, next) => {
  try {
    await wishlistSchema.findByIdAndDelete(req.params.id);

    res.status(201).json({
      success: true,
      message: "Remove From WIshlist",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  addProductsToWishlist,
  addWishlist,
  getWishlist,
  getWishlistProduct,
  removeWishlistProduct,
  wishlistProductCount,
  getWishlistProductById,
};
