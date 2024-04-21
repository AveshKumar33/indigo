const {
  deleteProductDescriptions,
  getProductDescriptiondetails,
  putProductDescriptions,
  posProductDescriptions,
  getProductDescriptions,
  removeImage,
} = require("../controller/productdescription");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();

router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("productimg", 10),
  posProductDescriptions
);
router.delete("/:id", deleteProductDescriptions);
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.array("productimg", 10),
  putProductDescriptions
);
router.get("/:id", getProductDescriptiondetails);
router.get("/getProductDescriptions/:id", getProductDescriptions);
router.delete("/deleteImg/:id/:name", verifyTokenAndAdmin, removeImage);
module.exports = router;
