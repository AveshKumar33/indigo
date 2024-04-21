const {
  deleteUOM,
  getUOMById,
  updateUOM,
  createUOM,
  getAllUOM,
} = require("../controller/UOMController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();

router.get("/", getAllUOM);
router.post("/", verifyTokenAndAdmin, createUOM);
router.delete("/:id", verifyTokenAndAdmin, deleteUOM);
router.put("/:id", verifyTokenAndAdmin, updateUOM);
router.get("/:id", getUOMById);

module.exports = router;
