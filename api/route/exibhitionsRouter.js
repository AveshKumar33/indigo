const router = require("express").Router();
const {
  deleteExibhitions,
  getExibhitionsDetails,
  putExibhitions,
  postExibhitions,
  getAllExibhitions,
  deleteImage,
} = require("../controller/exibhitionsController");
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

router.get("/", getAllExibhitions);
router.get("/:id", getExibhitionsDetails);
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.array("exibhitionsimg", 10),
  postExibhitions
);
router.delete("/:id", verifyTokenAndAdmin, deleteExibhitions);
router.put("/:id/:name", deleteImage);
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.array("exibhitionsimg", 10),
  putExibhitions
);

module.exports = router;
