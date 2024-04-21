const { deleteorders, getorderdetails, putorders, postorders, getorders,paytmCallback,updateOrderItem,InstallmentPayment } = require("../controller/orderController");
const upload = require("../utils/imageUploader");
const router = require("express").Router();

router.get("/",getorders)
router.post("/",upload.array("ordersImage", 1),postorders)
router.delete("/:id",deleteorders)
router.put("/:id",putorders)
router.get("/:id",getorderdetails)
router.post("/paytm/callback",paytmCallback)
router.put("/orderitem/:id",updateOrderItem)
router.put("/installmentpayment/:id",InstallmentPayment)



module.exports = router