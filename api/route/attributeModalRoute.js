const {
  deleteattribute,
  getattributedetails,
  putattribute,
  postattribute,
  getattribute,
  addattributeItemImage,
  removeattributeItemImage,
  removeattributeItemImageData,
  removeattributeItem,
  addattributeItem,
  getAttributeItems,
  updateAttributeItems,
  AddPositionsImages,
  GetPositionsImages,
  GetPositionsImageVariant,
  editPositionGroupImage,
  deletePositionGroupImage,
  DeletePosition,
} = require("../controller/atrributeController");

const { handleError } = require("../utils/handleError");

const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

const router = require("express").Router();

router.get("/", getattribute);

router.post("/", verifyTokenAndAdmin, postattribute);

router.delete("/:id", verifyTokenAndAdmin, deleteattribute);

router.put("/:id", verifyTokenAndAdmin, putattribute);

router.get("/:id", getattributedetails);

router.put(
  "/updateItem/:attributeid/:id",
  verifyTokenAndAdmin,
  upload.single("attributeimg"),
  addattributeItemImage
);
//  attributeId, variantId }
router.put(
  "/editPositionGroupImage/:attributeId/:variantId/:id/:index",
  // verifyTokenAndAdmin,
  upload.single("attributeimg"),
  editPositionGroupImage
);
router.delete(
  "/deletePositionGroupImage/:attributeId/:variantId/:id/:index",
  deletePositionGroupImage
);
// router.post(
//   "/AddPositionsImages/:attributeId/:variantId",
//   verifyTokenAndAdmin,
//   upload.single("attributeimg"),
//   AddPositionsImages
// );
router.get(
  "/GetPositionsImageVariant/:attributeId/:variantId",
  verifyTokenAndAdmin,
  GetPositionsImageVariant
);
router.put(
  "/DeletePosition/:attributeId/:variantId",
  // verifyTokenAndAdmin,
  DeletePosition
);
router.post(
  "/AddPositionsImages/:attributeId",
  verifyTokenAndAdmin,
  AddPositionsImages
);
router.get(
  "/GetPositionsImages/:attributeId",
  verifyTokenAndAdmin,
  GetPositionsImages
);

router.put(
  "/removeItem/:attributeid/:id",
  verifyTokenAndAdmin,
  removeattributeItemImage
);
router.put(
  "/removeattributeItemImage/:attributeid/:id",
  verifyTokenAndAdmin,
  removeattributeItemImageData
);

// Delete Attribute Item
router.put(
  "/deleteattributeItem/:attributeid/:id",
  verifyTokenAndAdmin,
  removeattributeItemImage
);

router.put(
  "/deleteattribute/:attributeid/:id",
  verifyTokenAndAdmin,
  removeattributeItem
);

router.put("/addattributeItem/:id", verifyTokenAndAdmin, addattributeItem);

router.post("/getAttributeItems", getAttributeItems);

router.put(
  "/updateAttributeItems/:id",
  verifyTokenAndAdmin,
  updateAttributeItems
);

module.exports = router;
