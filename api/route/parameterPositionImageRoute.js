const router = require("express").Router();
const fs = require("fs");
const upload = require("../utils/imageUploader");
const { handleError } = require("../utils/handleError");

const {
  deleteParameterPositionImageById,
  getParameterPositionImageById,
  updateParameterPositionImageById,
  createParameterPositionImage,
  getAllParameterPositionImage,
  getParameterPositionImageByAttributeId,
} = require("../controller/parameterPositionImgController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

router.get(
  "/:parameterId/:positionId/:attributeId",
  getParameterPositionImageByAttributeId
);
router.get("/:attributeId/:id", getParameterPositionImageById);
router.get("/", getAllParameterPositionImage);
router.delete("/:id", verifyTokenAndAdmin, deleteParameterPositionImageById);
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.single("pngName"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  createParameterPositionImage
);

router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.single("pngImage"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  updateParameterPositionImageById
);

module.exports = router;
