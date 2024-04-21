const {
  deletereview,
  getreviewdetails,
  putreview,
  postreview,
  getreview,
  getReviewByProduct,
  getReviewByProducttotalRating,
} = require("../controller/reviewController");
const { handleError } = require("../utils/handleError");
const upload = require("../utils/imageUploader");

const router = require("express").Router();

router.get("/", getreview);
router.get("/product/:id", getReviewByProduct);
router.get("/product/totalRating/:id", getReviewByProducttotalRating);
router.post("/", upload.single("reviewimg"), postreview);
router.delete("/:id", deletereview);
// router.put(
//   "/:id",
//   upload.single("reviewimg"),
//   (err, req, res, next) => {
//     if (err.code === "LIMIT_FILE_SIZE") {
//       next(handleError(500, err.message));
//       return;
//     }
//   },
//   putreview
// );
router.put("/:id", upload.single("reviewimg"), putreview);
router.get("/:id", getreviewdetails);

module.exports = router;
