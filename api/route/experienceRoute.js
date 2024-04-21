const router = require("express").Router();
const {
  deleteExperience,
  getExperienceDetails,
  putExperience,
  postExperience,
  getAllExperience,
  deleteImage,
} = require("../controller/experienceController");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

router.get("/", getAllExperience);
router.get("/:id", getExperienceDetails);
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("experienceimg", 10),
  postExperience
);
router.delete("/:id", verifyTokenAndAdmin, deleteExperience);
router.put("/:id/:name", deleteImage);
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.array("experienceimg", 10),
  putExperience
);

module.exports = router;
