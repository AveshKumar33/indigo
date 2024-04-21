const router = require("express").Router();
const upload = require("../utils/imageUploader");
const { handleError } = require("../utils/handleError");
const {
  checkUserIdExistence,
  checkUserCantDelete,
} = require("../middleware/checkUserExistance");

const {
  deleteusers,
  getusersdetails,
  putusers,
  postusers,
  getusers,
  userlogin,
  profileController,
  otpSent,
  otplogin,
} = require("../controller/userController");

const { verifyToken } = require("../utils/verifyToken");

router.get("/", getusers);

router.post(
  "/",
  upload.single("userimg"),
  (err, req, res, next) => {
    if (err) {
      next(handleError(500, err.message));
      return;
    }

    // if (err.code === "LIMIT_FILE_SIZE") {
    //   next(handleError(500, err.message));
    //   return;
    // }
  },

  //Post User Controller
  postusers
);

router.put(
  "/:id",
  upload.single("userimg"),
  (err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(handleError(500, err.message));
      return;
    }
  },
  putusers
);
router.delete(
  "/:id",
  verifyToken,
  checkUserCantDelete,
  checkUserIdExistence,
  deleteusers
);
router.get("/:id", getusersdetails);
router.post("/login", userlogin);
router.get("/profile/me", verifyToken, profileController);

router.post("/otp-sent", otpSent);

router.post("/verify-otp", otplogin);

module.exports = router;
