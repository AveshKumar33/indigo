const {
  getallImages,
  deleteImages,
} = require("../controller/imgFetchingController");
const upload = require("../utils/imageUploader");
const router = require("express").Router();

router.post("/product", upload.array("productimg", 10), async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Image Uploaded Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/user", upload.array("userimg", 10), async (req, res) => {

  try {
    res.status(200).json({
      success: true,
      message: "Image Uploaded Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/", getallImages);

router.delete("/:foldername/:filename", deleteImages);

module.exports = router;
