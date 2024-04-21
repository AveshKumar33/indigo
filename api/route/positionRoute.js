const router = require("express").Router();

const {
  deletePositionById,
  getPositionById,
  updatePositionById,
  createPosition,
  getAllPosition,
  getAllSimilerAttCount,
  getPositionByAttributeId,
} = require("../controller/positionController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

router.get("/", getAllPosition);
router.get("/count", getAllSimilerAttCount);
router.get("/attribute-id/:id", getPositionByAttributeId);
router.delete("/:id", verifyTokenAndAdmin, deletePositionById);
router.get("/:id", getPositionById);
router.put("/:id", verifyTokenAndAdmin, updatePositionById);
router.post("/", verifyTokenAndAdmin, createPosition);

module.exports = router;
