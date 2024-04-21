const {
  deleteCollectionTag,
  getCollectionTagdetails,
  createCollectionTag,
  updateCollectionTag,
  getAllCollectionTag,
} = require("../controller/collectionTagController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();

router.get("/", getAllCollectionTag);
router.post("/", verifyTokenAndAdmin, createCollectionTag);
router.delete("/:id", deleteCollectionTag);
router.put("/:id", verifyTokenAndAdmin, updateCollectionTag);
router.get("/:id", getCollectionTagdetails);

module.exports = router;
