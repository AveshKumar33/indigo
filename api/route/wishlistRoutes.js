const router = require("express").Router();

const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const {
  addProductsToWishlist,
  addWishlist,
  getWishlist,
  getWishlistProduct,
  removeWishlistProduct,
  wishlistProductCount,
  getWishlistProductById,
} = require("../controller/wishlistController");

/*Adding New Product to wishlist*/
router.post("/", verifyTokenAndAdmin, addWishlist);

// adding localstorage wishlist products
router.post("/all", verifyTokenAndAdmin, addProductsToWishlist);

router.get("/", verifyTokenAndAdmin, getWishlist);

router.get("/id", verifyTokenAndAdmin, getWishlistProductById);

router.get("/count", verifyTokenAndAdmin, wishlistProductCount);

// get wishlist for product list
router.get("/for-list", verifyTokenAndAdmin, getWishlistProduct);

router.delete("/:id", verifyTokenAndAdmin, removeWishlistProduct);

module.exports = router;
