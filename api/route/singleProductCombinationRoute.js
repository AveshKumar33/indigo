const router = require("express").Router();
const fs = require("fs");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const {
  getAllsingleProductCombination,
  getSingleProductCombination,
  getDefaultSingleProductCombinationByProductId,
  updateAllProductCombinationsBySPId,
  updateProductCombinationsById,
  getCombinationsByproductId,
  fullTextSearchFunctionality,
} = require("../controller/singleProductCombinationController");

/**get all  products  */
router.get("/combination", getSingleProductCombination);
router.get("/:singleProductId", getAllsingleProductCombination);
router.get("/combination/single/product/:siPId", getCombinationsByproductId);

router.get(
  "/default/:singleProductId",
  getDefaultSingleProductCombinationByProductId
);

// /**get  products by id   */
// router.get("/:id", getproductById);

// //Adding New  Product Route
// router.post(
//   "/",
//   verifyTokenAndAdmin,
//   upload.array("productimg", 10),
//   createProduct
// );
/**update product by id   */
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.single("image"),
  updateProductCombinationsById
);

/**update isDefault for all combinations */
router.put(
  "/:spid/:id",
  verifyTokenAndAdmin,
  updateAllProductCombinationsBySPId
);

//Get all the Product with matched name
router.get("/productsearch/:productname", fullTextSearchFunctionality);

// /**delete  product by id  */
// router.delete("/:id", deleteProductById);

// /**delete image  by  product id */
// router.delete("/image/:id/:name", removeImage);

module.exports = router;
