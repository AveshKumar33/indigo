const router = require("express").Router();
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const {
  createCustomizedProductCombination,
  getAllCustomizedproductCombination,
  getCustomizedProductCombinationById,
  fetchCustomizeProductWithCombinationsById,
  fetchCustomizeProductWithCombinationsByUrl,
  getCombinationsByproductId,
  getAllCustomizedproductCombinationProductIds,
} = require("../controller/customizeProductCombinationController");

/**get all customize products  */
router.get("/", getAllCustomizedproductCombination);

router.get("/product-id", getAllCustomizedproductCombinationProductIds);
router.get(
  "/combination/customize/product/:cusPId",
  getCombinationsByproductId
);

/**get  customize products by id   */
router.get("/:pid", getCustomizedProductCombinationById);
router.get("/combination/url/:url", fetchCustomizeProductWithCombinationsByUrl);
router.get("/combination/:pid", fetchCustomizeProductWithCombinationsById);

/*Adding New  customize Product Route*/
router.post("/", verifyTokenAndAdmin, createCustomizedProductCombination);

/**update customize product by id   */
// router.put("/:id", verifyTokenAndAdmin, updateCustomizedProductById);

// /**delete customize product by id  */
// router.delete("/:id", deleteCustomizedProductById);

module.exports = router;
