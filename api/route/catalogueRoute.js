const {
  deletecatalogue,
  getcataloguedetails,
  putcatalogue,
  postcatalogue,
  getcatalogue,
} = require("../controller/catalogueController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const upload = require("../utils/imageUploader");
const router = require("express").Router();
const { handleError } = require("../utils/handleError");

router.get("/", getcatalogue);
router.post(
  "/",
  verifyTokenAndAdmin,
  upload.fields([
    { name: "catalogueimg", maxCount: 1 },
    { name: "cataloguepdf", maxCount: 1 },
  ]),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }
  },
  postcatalogue
);
router.delete("/:id", deletecatalogue);
router.put(
  "/:id",
  verifyTokenAndAdmin,
  upload.fields([
    { name: "catalogueimg", maxCount: 1 },
    { name: "cataloguepdf", maxCount: 1 },
  ]),
  (err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(handleError(500, err.message));
      return;
    }
  },
  putcatalogue
);
router.get("/:id", getcataloguedetails);

module.exports = router;
