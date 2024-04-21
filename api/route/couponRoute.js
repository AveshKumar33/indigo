const { deletecoupons, getcouponsdetails, putcoupons, postcoupons, getcoupons } = require("../controller/couponController");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");
const router = require("express").Router();

router.get("/",getcoupons)
router.post("/",verifyTokenAndAdmin,postcoupons)
router.delete("/:id",verifyTokenAndAdmin,deletecoupons)
router.put("/:id",verifyTokenAndAdmin,putcoupons)
router.get("/:id",getcouponsdetails)



module.exports = router