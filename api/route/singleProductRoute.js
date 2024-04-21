const router = require("express").Router();
const fs = require("fs");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const {
  createProduct,
  getAllproduct,
  getproductById,
  deleteProductById,
  updateProductById,
  removeImage,
  fetchProductByUrlhandle,
  findProductByTags,
  getWishlistProducts,
  getAllFeatureProducts,
  getAllCustomizeDotProductByProductId,
  getProducts,
} = require("../controller/singleProductController");

/**get all single products  */
router.get("/", getAllproduct);

router.get("/url-handle/:url", fetchProductByUrlhandle);

router.post("/product-tag", findProductByTags);
/**get all wishlist  single products by id   */
router.get("/get-all-wishlist", getWishlistProducts);
/**get all customize feature products   */
router.get("/get-all-feature-product", getAllFeatureProducts);

router.get("/product-id/:pId", getAllCustomizeDotProductByProductId);

/**get  single products by id   */
router.get("/all", getProducts);
router.get("/:id", getproductById);

/*Adding New  single Product Route*/
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("productimg", 10),
  createProduct
);
/**update single product by id   */
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.array("productimg", 10),
  updateProductById
);

/**delete single product by id  */
router.delete("/:id", deleteProductById);

/**delete image  by single product id */
router.delete("/image/:id/:name", removeImage);

module.exports = router;
