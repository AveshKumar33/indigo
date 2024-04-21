const router = require("express").Router();
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const { handleError } = require("../utils/handleError");

const {
  createCustomizeDotProductImage,
  getAllCustomizeDotProductImages,
  customizeDotProductImagesById,
  updateCustomizeDotProductImage,
  deleteCustomizeDotProductImageById,
  customizeDotProductImagesByProductId,
} = require("../controller/customizeDotProductImageController");

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
  createCustomizeDotProductImage
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
  updateCustomizeDotProductImage
);

router.get("/", getAllCustomizeDotProductImages);

router.get("/:id", customizeDotProductImagesByProductId);

router.get("/obj/:id", customizeDotProductImagesById);

router.delete("/:id", deleteCustomizeDotProductImageById);

module.exports = router;
