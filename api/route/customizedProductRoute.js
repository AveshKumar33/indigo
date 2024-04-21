const router = require("express").Router();
const fs = require("fs");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const {
  createCustomizedProduct,
  getAllCustomizedproduct,
  getproductById,
  removeImage,
  deleteCustomizedProductById,
  updateCustomizedProductById,
  getProductByTags,
  getWishlistProducts,
  getAllFeatureProducts,
  getProductParametersAndPostions,
} = require("../controller/customizedProductController");

/**get all customize products  */
router.get("/", getAllCustomizedproduct);
/**get all wishlist  customize products by id   */
router.get("/get-all-wishlist", getWishlistProducts);

/**get all customize feature products   */
router.get("/get-all-feature-product", getAllFeatureProducts);

router.post("/product-tag", getProductByTags);

/**get  customize Product Parameters, Postions and products by product id   */
router.get("/all-details/:id", getProductParametersAndPostions);

// router.get("/all-details/:id", getProductParametersAndPostions);

/**get  customize products by id   */
router.get("/:id", getproductById);

/*Adding New  customize Product Route*/
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("productimg", 10),
  createCustomizedProduct
);

/**update customize product by id   */
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.array("productimg", 10),
  updateCustomizedProductById
);

/**delete customize product by id  */
router.delete("/:id", deleteCustomizedProductById);

// router.get("/url-handle/:url", fetchProductByUrlhandle);

// router.post("/product-tag", findProductByTags);

/**delete image  by customize product id */
router.delete("/image/:id/:name", removeImage);

module.exports = router;
