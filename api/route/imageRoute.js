const { deleteimages, getimagedetails, postimages, getimages } = require("../controller/imaguploadController");
const router = require("express").Router();
const upload = require("../utils/imageUploader");


router.get("/",getimages)
router.post("/",upload.array("productimg", 10),postimages)
router.delete("/:id",deleteimages)
router.get("/:id",getimagedetails)



module.exports = router