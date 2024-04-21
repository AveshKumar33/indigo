const router = require("express").Router();
const upload = require("../utils/imageUploader");
const { handleError } = require("../utils/handleError");

const {
  getAttributeByFilter,
  deleteParameterById,
  getParameterById,
  updateParameterById,
  createParameter,
  getAllParameter,
  getParameterByAttributeId,
  getAllSimilerAttCount,
  getAllParameterByAttributeId,
  getAllSingleProductParameterByAttributeId,
} = require("../controller/parameterController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

router.get("/filter", getAttributeByFilter);
router.get("/", getAllParameter);
router.get("/count", getAllSimilerAttCount);
router.delete("/:id", verifyTokenAndAdmin, deleteParameterById);
router.get("/:id", getParameterById);
router.get(
  "/attribute-id/single-product/all/:id",
  getAllSingleProductParameterByAttributeId
);
router.get("/attribute-id/all/:id", getAllParameterByAttributeId);
router.get("/attribute-id/:id", getParameterByAttributeId);

router.post(
  "/",
  verifyTokenAndAdmin,
  upload.single("profileImage"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  createParameter
);

router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.single("profileImage"),
  (err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(handleError(500, err.message));
      return;
    }
  },
  updateParameterById
);

module.exports = router;
