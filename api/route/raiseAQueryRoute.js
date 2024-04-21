const {
  getallService,
  postservice,
  putservice,
  deleteservice,
  servicedetails,
} = require("../controller/raiseAQueryController");
const router = require("express").Router();

router.get("/", getallService);
router.post("/", postservice);
router.put("/:id", putservice);
router.delete("/:id", deleteservice);
router.get("/:id", servicedetails);

module.exports = router;
