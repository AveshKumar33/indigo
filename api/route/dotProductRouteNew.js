const { handleError } = require("../utils/handleError");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();
const {
  createDotProduct,
  getAllDotProduct,
  dotProductsGetById,
  updateDotProduct,
  deleteDotProductById,
  addImages,
  deleteImage,
  getDotProducts,
  dotProductsGetByIdForClient,
} = require("../controller/dotProductControllerNew");

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
  createDotProduct
);

router.delete("/:id", verifyTokenAndAdmin, deleteDotProductById);

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
  updateDotProduct
);

router.get("/", getAllDotProduct);
router.get("/all", getDotProducts);
router.get("/client/:id", dotProductsGetByIdForClient);

router.get("/:id", dotProductsGetById);

module.exports = router;
