const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();
const {
  addCustomizedComRectangleboProduct,
  getAllCustomizedCombo,
  getProductsById,
  updateProduct,
  deleteDotProductById,
  getAllCustomizedCombinationsRectangle,
  getAllCustomizedCombinationsRectangleById,
} = require("../controller/customizeComboRectangleController");

router.post("/", verifyTokenAndAdmin, addCustomizedComRectangleboProduct);

router.delete("/:id", verifyTokenAndAdmin, deleteDotProductById);

router.put("/:id", verifyTokenAndAdmin, updateProduct);

router.get("/all-product", getAllCustomizedCombinationsRectangle);

router.get("/all/:prouctId", getAllCustomizedCombo);

router.get("/client/:id", getAllCustomizedCombinationsRectangleById);

router.get("/:id", getProductsById);

module.exports = router;
