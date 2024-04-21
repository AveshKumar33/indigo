const {
  deleteCollectionFilters,
  getCollectionFilterdetails,
  createCollectionFilters,
  updateCollectionFilters,
  getAllCollectionFilters,
  getAllDotProducts,
} = require("../controller/collectionFilterNewController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();
router.get("/dot/products", getAllDotProducts);
router.get("/", getAllCollectionFilters);
router.post("/", verifyTokenAndAdmin, createCollectionFilters);
router.delete("/:id", deleteCollectionFilters);
router.put("/:id", verifyTokenAndAdmin, updateCollectionFilters);
router.get("/:id", getCollectionFilterdetails);

module.exports = router;
