const {
  deletedotCustomized,
  getdotCustomized,
  postdotCustomized,
  putdotCustomized,
  adddotCustomized,
  getdotCustomizeddetails,
} = require("../controller/dotCustomizedController");

const { handleError } = require("../utils/handleError");

const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

const router = require("express").Router();

router.get("/", getdotCustomized);

router.post(
  "/",
  verifyTokenAndAdmin,
  upload.single("dotcustomizedimg"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  postdotCustomized
);

router.delete("/:id", verifyTokenAndAdmin, deletedotCustomized);

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
  putdotCustomized
);

router.get("/:id", getdotCustomizeddetails);

module.exports = router;
