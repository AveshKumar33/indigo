const {
  deleteCollectionFilters,
  getCollectionFilterdetails,
  putCollectionFilters,
  posCollectionFilters,
  getCollectionFilterdetailsFromProduct,
  getCollectionFilters,
  AddTagCollectionFilters,
} = require("../controller/CollectionFiltersController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

const router = require("express").Router();

router.get("/", getCollectionFilters);
router.post("/", verifyTokenAndAdmin, posCollectionFilters);
router.put("/AddTags/:id", verifyTokenAndAdmin, AddTagCollectionFilters);
router.delete("/:id", verifyTokenAndAdmin, deleteCollectionFilters);
router.put("/:id", verifyTokenAndAdmin, putCollectionFilters);
router.get("/:id", getCollectionFilterdetails);
router.get("/filter/tags", getCollectionFilterdetailsFromProduct);

module.exports = router;
