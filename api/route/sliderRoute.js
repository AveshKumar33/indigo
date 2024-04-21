const {
  getImges,
  addImage,
  deleteImage,
} = require("../controller/sliderController");
const { handleError } = require("../utils/handleError");
const upload = require("../utils/imageUploader");
const router = require("express").Router();

router.get("/", getImges);

router.post(
  "/",
  upload.single("sliderimg"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  addImage
);

router.delete("/:id", deleteImage);

module.exports = router;
