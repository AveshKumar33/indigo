const router = require("express").Router();
const {
  getAllHeaderImage,
  getChildHeaderImage,
  updateHeaderImageById,
  getHeaderImageByTitle,
} = require("../controller/headerImageController");

const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

router.get("/", getAllHeaderImage);
router.get("/title/:title", getHeaderImageByTitle);
router.get("/:rootCollectionId", getChildHeaderImage);
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.single("headerImage"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  updateHeaderImageById
);

module.exports = router;
