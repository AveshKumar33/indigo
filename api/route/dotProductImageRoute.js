const router = require("express").Router();
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const { handleError } = require("../utils/handleError");

const {
  createDotProductImage,
  getAllDotProductImages,
  dotProductImagesById,
  updateDotProductImage,
  dotProductImagesByProductId,
  deleteDotProductImageById,
} = require("../controller/dotProductImageController");

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
  createDotProductImage
);

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
  updateDotProductImage
);

router.get("/", getAllDotProductImages);

router.get("/:id", dotProductImagesByProductId);

router.get("/obj/:id", dotProductImagesById);

router.delete("/:id", deleteDotProductImageById);

module.exports = router;
