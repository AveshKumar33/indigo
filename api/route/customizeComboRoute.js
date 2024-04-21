const { handleError } = require("../utils/handleError");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();
const {
  customizedComboProduct,
  getAllCustomizedCombo,
  getProductsById,
  updateProduct,
  getWishlistProducts,
  deleteDotProductById,
} = require("../controller/customizedComboController");

/**get all wishlist  single products by id s  */
router.get("/get-all-wishlist", getWishlistProducts);
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.single("productimg"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  customizedComboProduct
);

router.delete("/:id", verifyTokenAndAdmin, deleteDotProductById);

router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.single("productimg"),
  (err, req, res, next) => {
    if (err) {
      console.log(err);
      next(handleError(500, err.message));
      return;
    }
  },
  updateProduct
);

router.get("/", getAllCustomizedCombo);

router.get("/:id", getProductsById);

module.exports = router;
