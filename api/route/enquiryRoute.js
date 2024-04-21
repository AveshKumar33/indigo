const {
  deleteenquiry,
  getenquirydetails,
  putenquiry,
  postenquiry,
  getenquiry,
} = require("../controller/enquiryController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");


const router = require("express").Router();

router.get("/", getenquiry);
router.post("/",postenquiry);
router.delete("/:id",verifyTokenAndAdmin, deleteenquiry);
router.put("/:id", verifyTokenAndAdmin,putenquiry);
router.get("/:id", getenquirydetails);

module.exports = router;
