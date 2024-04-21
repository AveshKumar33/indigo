const {
  deleteAttribute,
  getAttributeById,
  updateAttribute,
  createAttribute,
  getAllAttribute,
} = require("../controller/attributeNewController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();

router.get("/", getAllAttribute);
router.post("/", verifyTokenAndAdmin, createAttribute);
router.delete("/:id", verifyTokenAndAdmin, deleteAttribute);
router.put("/:id", verifyTokenAndAdmin, updateAttribute);
router.get("/:id", getAttributeById);

module.exports = router;
