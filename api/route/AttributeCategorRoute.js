const {
  getAttributeCategors,
  posAttributeCategors,
  deleteAttributeCategors,
  putAttributeCategors,
  getAttributeCategordetails,
} = require("../controller/AttributeCategoryController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();

router.get("/", getAttributeCategors);
router.post("/", verifyTokenAndAdmin, posAttributeCategors);
router.delete("/:id", verifyTokenAndAdmin, deleteAttributeCategors);
router.put("/:id", verifyTokenAndAdmin, putAttributeCategors);
router.get("/:id", getAttributeCategordetails);

module.exports = router;
