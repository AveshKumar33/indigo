const { handleError } = require("../utils/handleError");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();
const {
  createCustomizeDotProduct,
  getAllCustomizeDotProduct,
  custonizeDotProductsGetById,
  updateCustomizeDotProduct,
  deleteCustomizeDotProductById,
  addImages,
  deleteImage,
  getCustomizeDotProducts,
  getAllCustomizeDotProductByProductId,
  custonizeDotProductsGetByIdForEdit,
  getWishlistProducts,
} = require("../controller/customizeDotProductController");

/**all routers  */

// router.post("/filterByTag", getDataByFilter);
router.put("/add-images/:id", upload.single("dotimg"), addImages);
// router.put("/UpdatedImageDot/:id/:imageObjId", UpdatedImageDot);
router.put("/delete-image/:id/:imageId", deleteImage);

router.post(
  "/",
  verifyTokenAndAdmin,
  upload.single("dotimg"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  createCustomizeDotProduct
);

router.delete("/:id", verifyTokenAndAdmin, deleteCustomizeDotProductById);

router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.single("dotimg"),
  (err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(handleError(500, err.message));
      return;
    }
  },
  updateCustomizeDotProduct
);

router.get("/", getAllCustomizeDotProduct);
router.get("/data/wishlist", getWishlistProducts);
router.get("/product-id/:pId", getAllCustomizeDotProductByProductId);
router.get("/all", getCustomizeDotProducts);

router.get("/edit/:id", custonizeDotProductsGetByIdForEdit);
router.get("/:id", custonizeDotProductsGetById);

module.exports = router;
