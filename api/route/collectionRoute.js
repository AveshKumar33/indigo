const router = require("express").Router();
const {
  deletecollections,
  getcollectiondetails,
  putcollections,
  postcollections,
  getcollections,
  getmatchedcollectionproduct,
  removeImage,
  uploadVideo,
  removeVideo,
  getCollectionDataByUrl,
  fetchChildCollectionsDetails,
  updateCollection,
  getRootCollection,
  getChildCollection,
  getmatchedcollectionCustomizedproduct,
  getCollectionByName,
  getMostSellingCollections,
  getHeader,
} = require("../controller/collectioncontroller");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

router.get("/", getcollections);
router.get("/most/selling", getMostSellingCollections);
router.get("/getHeader", getHeader);
router.get("/getRootCollection", getRootCollection);
router.get("/getCollectionByName", getCollectionByName);
router.post("/getChildCollection", getChildCollection);
router.put("/updateCollection", updateCollection);
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("CollectionImage", 10),
  postcollections
);
router.delete("/:id", verifyTokenAndAdmin, deletecollections);
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.array("CollectionImage", 10),
  putcollections
);

router.get("/:id", getcollectiondetails);
router.get("/collectiondetails/:url", getmatchedcollectionproduct);
router.get("/url-name/:url", getCollectionDataByUrl);
router.get("/get-all-child-collection/:id", fetchChildCollectionsDetails);
router.get(
  "/collectiondetails/customize/:url",
  getmatchedcollectionCustomizedproduct
);

router.put(
  "/uploadCollectionVideo/name/:id",
  upload.array("uploadCollectionVideo", 10),
  uploadVideo
);

router.delete("/delete/video/:id/:name", removeVideo);
router.delete("/:id/:name", removeImage);

module.exports = router;
