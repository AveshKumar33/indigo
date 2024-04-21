const { deletetags, gettagdetails, puttags, postags, gettags  } = require("../controller/tagsController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();


router.get("/",gettags)
router.post("/",verifyTokenAndAdmin,postags)
router.delete("/:id",verifyTokenAndAdmin,deletetags)
router.put("/:id",verifyTokenAndAdmin,puttags)
router.get("/:id",gettagdetails)



module.exports = router