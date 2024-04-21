const router = require("express").Router();
const ProductSchema = require("../modal/productmodal");
const upload = require("../utils/imageUploader");
const fs = require("fs");

const {
  getproduct,
  postproduct,
  putProduct,
  deleteproduct,
  getproductdetails,
  removeImage,
  findproductbytags,
  addattribute,
  removeattribute,
  addattributeItem,
  removeattributeItem,
  updatevarient,
  uploadVarientImage,
  deleteVarientImage,
  getfilteredProduct,
  getpopulatevarientdata,
  changevarientposition,
  updateVarientList,
  upadteAttributePosition,
  getproductvarientSameasFront,
  upadteAttributeBackPosition,
  fullTextSearchFunctionality,
  getwhislist,
  newpostproduct,
  findproductbytagsInCustomizedProduct,
  updateDefaultValue,
  Urlhandle,
  updatevarientMulti,
  uploadVideo,
  removeVideo,
  updateData,
  AttributeSetting,
  removeDuplicateAttribute,
  getproductvarientFront,
} = require("../controller/productController");
const {
  checkCustomizedProductAvailabilty,
} = require("../middleware/CheckCustomizedProduct");
const {
  checkDotProductAvailabilty,
} = require("../middleware/CheckproductAvailabilityOnDotProduct");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

router.get("/", getproduct);
router.post("/Urlhandle", Urlhandle);

// router.post("/",upload.array("productimg", 10),postproduct)

//Adding New Product Route

router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("productimg", 10),
  newpostproduct
);

router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.array("productimg", 10),
  removeDuplicateAttribute,
  putProduct
);

router.delete(
  "/:id",
  verifyTokenAndAdmin,
  checkCustomizedProductAvailabilty,
  checkDotProductAvailabilty,
  deleteproduct
);

router.delete("/:id/:name", verifyTokenAndAdmin, removeImage);
router.delete("/delete/video/:id/:name", removeVideo);

router.get("/:id", getproductdetails);

router.post("/producttag/product", findproductbytags);

router.put("/update/data/:id", updateData);

router.post(
  "/producttag/customizedproduct",
  findproductbytagsInCustomizedProduct
);

router.put(
  "/uploadProductVideo/name/:id",
  upload.array("uploadProductVideo", 10),
  uploadVideo
);

//Product Variation Add with Attribute
router.put("/addattribute/:id", verifyTokenAndAdmin, addattribute);

//Product Variation Creation with Attribute Remove
router.put("/removeattribute/:id/:name", verifyTokenAndAdmin, removeattribute);

//Product Variation Creation with Add Attribute Item
router.put(
  "/addattributeitem/:id/:name",
  verifyTokenAndAdmin,
  addattributeItem
);

//Product Variation Creation with Remove Attribute Item
router.put(
  "/removeattributeitem/:id/:name",
  verifyTokenAndAdmin,
  removeattributeItem
);

//Update VArient
router.put("/updatevarient/:id", verifyTokenAndAdmin, updatevarient);
router.put("/updatevarientMulti/:id", updatevarientMulti);
router.put("/updateDefaultValue/:id", updateDefaultValue);

//Varient Image Uploading
router.put(
  "/updatevarientimage/:id",
  verifyTokenAndAdmin,
  upload.array("productimg", 10),
  uploadVarientImage
);

//varient Image Delete
router.put("/deletevarientimage/:id", verifyTokenAndAdmin, deleteVarientImage);

//Get Filtered Product data
router.get("/filteredproduct/query", getfilteredProduct);

//Change the position of varient
router.put("/changevarient/:id", changevarientposition);

//Get filteredfkl;ksjdjksa
router.get("/p/pp/", getpopulatevarientdata);

//Update Product Varient
router.put("/updateVarientList/:id", updateVarientList);

//Update Position of Attribute
router.put(
  "/updateAttributeImagePosition/:attributePositionid/:id",
  upadteAttributePosition
);
router.put("/AttributeSetting/:itemId/:id", AttributeSetting);

//Update Position and Quantity of Back View
router.put(
  "/updateBackAttributeImagePosition/:attributeBackPositionid/:id",
  upadteAttributeBackPosition
);

//Genreate Image through Api

// router.post("/genrateimagethroughApi",genrateimagethroughApi)

//Genrate All the Possible Varient
router.post("/getproductvarientSameasFront/:id", getproductvarientSameasFront);
router.post("/getproductvarientFront/:id", getproductvarientFront);

//Get all the Product with matched name
router.get("/productsearch/:productname", fullTextSearchFunctionality);

//Get All the Whishlist Product
router.post("/whislist", getwhislist);

module.exports = router;
