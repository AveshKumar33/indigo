const router = require("express").Router();
const {getblog,postblog,putblog,deleteblog,blogdetails,BlogFindByUrl,removeImage,addImage} = require("../controller/blogController");
const upload = require("../utils/imageUploader");

router.get("/",getblog);
router.post("/",postblog);
router.put("/:id",putblog);
router.delete("/:id",deleteblog);
router.get("/:id",blogdetails);
router.post('/add-image/:id',upload.single("blogimg"),addImage)
router.delete('/remove-image/:id/:name',removeImage)
router.get("/fetchblogbyurl/:url",BlogFindByUrl);





module.exports = router
