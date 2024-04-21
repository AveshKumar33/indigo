const {
  deletedot,
  getdotdetails,
  putdot,
  postdot,
  getdot,
  addDots,
  getDataByFilter,
  AddImages,
  UpdatedImageDot,
  deleteImageObj,
} = require("../controller/dotController");

const { handleError } = require("../utils/handleError");

const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

const router = require("express").Router();

router.get("/", getdot);
router.post("/filterByTag", getDataByFilter);
router.post("/AddImages/:id", upload.single("dotimg"), AddImages);
router.put("/UpdatedImageDot/:id/:imageObjId",  UpdatedImageDot);
router.put("/deleteImageObj/:id/:imageObjId",  deleteImageObj);

router.post(
  "/",
  // verifyTokenAndAdmin,
  upload.single("dotimg"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  postdot
);

router.delete("/:id", verifyTokenAndAdmin, deletedot);

router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.single("dotimg"),
  (err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(handleError(500, err.message));
      return;
    }
  },
  putdot
);

router.get("/:id", getdotdetails);

module.exports = router;
