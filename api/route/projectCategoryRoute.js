const { deleteprojectCategory, getprojectCategorydetails, putprojectCategory, posprojectCategory, getprojectCategory } = require("../controller/projectCategoryController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();


router.get("/",getprojectCategory)
router.post("/",posprojectCategory)
router.delete("/:id",deleteprojectCategory)
router.put("/:id",putprojectCategory)
router.get("/:id",getprojectCategorydetails)



module.exports = router