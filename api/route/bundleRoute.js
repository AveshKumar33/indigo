const { deleteproductBundle, getproductbundledetails, putproductBundle, postproductBundle, getproductBundle,removeImage} = require("../controller/bundleController");
const router = require("express").Router();
const upload = require("../utils/imageUploader");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");


router.get("/",getproductBundle)
router.post("/",verifyTokenAndAdmin,upload.array("bundleimg", 10),postproductBundle)
router.delete("/:id",verifyTokenAndAdmin,deleteproductBundle)
router.put("/:id",verifyTokenAndAdmin,upload.array("bundleimg", 10),putproductBundle)
router.get("/:id",getproductbundledetails)
router.delete("/:id/:name",verifyTokenAndAdmin,removeImage)



module.exports = router