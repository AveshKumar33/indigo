const router = require("express").Router();
const upload = require("../utils/imageUploader");

const {
  deleteproject,
  getprojectdetails,
  putproject,
  postproject,
  getproject,
  removeImage,
} = require("../controller/projectController");

//Get Project
router.get("/", getproject);

//Post Project
router.post(
  "/",
  // upload.fields([
  //   {
  //     name: "projectvideo",
  //     maxCount: 1,
  //   },
  //   { name: "projectimg", maxCount: 4 },
  // ]),
  upload.array("projectimg", 10),
  postproject
);

router.put(
  "/:id",
  // upload.fields([
  //   {
  //     name: "projectvideo",
  //     maxCount: 1,
  //   },
  //   { name: "projectimg", maxCount: 4 },
  // ]),
  upload.array("projectimg", 10),
  putproject
);

router.get("/:id", getprojectdetails);

router.delete("/:id", deleteproject);

router.post("/deleteimage/:id", removeImage);

module.exports = router;
