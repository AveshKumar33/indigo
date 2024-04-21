const router = require("express").Router();
const {
  deleteAboutUs,
  getAboutUsDetails,
  putAboutUs,
  postAboutUs,
  getAllAboutUs,
  deleteImage,
} = require("../controller/aboutUsController");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

router.get("/", getAllAboutUs);
router.get("/:id", getAboutUsDetails);
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("aboutusimg", 10),
  postAboutUs
);
router.delete("/:id", verifyTokenAndAdmin, deleteAboutUs);
router.put("/:id/:name", deleteImage);
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.array("aboutusimg", 10),
  putAboutUs
);

module.exports = router;
