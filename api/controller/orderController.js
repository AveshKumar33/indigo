const orderSchema = require("../modal/order");
const { handleError } = require("../utils/handleError");
const Razorpay = require("razorpay");
require("dotenv").config();
const paytm = require("../utils/PaytmChecksum");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const formidable = require("formidable");

const getorders = async (req, res, next) => {
  try {
    const orders = await orderSchema
      .find(req.query ? req.query : {})
      .populate("UserDetails", "-__v -createdAt -updatedAt")
      .populate("Coupon", "-__v -createdAt -updatedAt");
    res.status(200).json({
      success: true,
      data: orders,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postorders = async (req, res, next) => {
  try {
    // // const lastDocument = await orderSchema.findOne({}, { $sort: { _id: -1 } },{projection: { _id: 0 }});
    const lastDocument = await orderSchema
      .find({})
      .limit(1)
      .sort({ $natural: -1 });
    let lastdocumentdata = lastDocument[0];

    if (lastDocument && lastdocumentdata && lastdocumentdata.OrderID) {
      req.body.OrderID = lastdocumentdata.OrderID + 1;
    } else {
      req.body.OrderID = 1001;
    }

    // console.log("req", req.body)
    const {
      Amount,
      Name,
      Phone,
      Email,
      Coupon,
      PinCode,
      City,
      State,
      Address,
      orderItems,
      paymentStatus,
      UserDetails,
      DiscountAmount,
      Remarks,
      OrderID,
    } = req.body;

    const que = {};

    if (Coupon & (Coupon != "undefined")) {
      que["Coupon"] = Coupon;
    }

    let imgdata = [];

    if (req.files) {
      req?.files?.map((m) => imgdata.push(m.filename));
    }
    //Transfer to the Razorpay
    const orderdata = await orderSchema.create({
      Amount,
      OrderID,
      Name,
      Phone,
      Email,
      PinCode,
      City,
      State,
      Address,
      orderItems: JSON.parse(orderItems),
      paymentStatus,
      UserDetails,
      DiscountAmount,
      Remarks,
      orderFiles: imgdata,
      ...que,
    });
    let order = await razorpayPayment(Amount);

    res.status(200).json({ order, orderdata });

    //Transfer to PAytm
    // const orderdata = await orderSchema.create(req.body);

    // paytmPayment.then((response) => {
    //   console.log(response,"sss")

    // }).catch((error)=>{
    //   console.log("error",error)
    // })

    // const order = await orderSchema.create(req.body);

    // let paytmParams = await paytmPayment(order._id);

    // console.log("paytmpara", paytmParams);

    // console.log("two");
    // console.log("paytmParams", paytmParams);

    // res.status(200).json({
    //   paytmParams,
    // });
  } catch (error) {
    console.log(error, "error");
    next(handleError(500, error.message));
  }
};

const putorders = async (req, res, next) => {
  try {
    const orders = await orderSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: orders,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getorderdetails = async (req, res, next) => {
  try {
    const orders = await orderSchema.findById(req.params.id).populate("Coupon");
    res.status(200).json({
      success: true,
      data: orders,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteorders = async (req, res, next) => {
  try {
    const orders = await orderSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "orders Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const razorpayPayment = async (Amount) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: Amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt_order_74394",
    };

    const order = await instance.orders.create(options);

    return order;
  } catch (error) {
    return error;
  }
};

const paytmPayment = async (orderid) => {
  // const { amount, email, phoneNo } = req.body;
  let amount = 100;
  let email = "mihir@digisidekick.com";
  let phoneNo = 9110193437;

  var params = {};

  /* initialize an array */
  params["MID"] = process.env.PAYTM_MID;
  params["WEBSITE"] = process.env.PAYTM_WEBSITE;
  params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
  params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE_ID;
  params["ORDER_ID"] = 2293;
  params["CUST_ID"] = process.env.PAYTM_CUST_ID;
  params["TXN_AMOUNT"] = JSON.stringify(amount);
  // params["CALLBACK_URL"] = `${req.protocol}://${req.get("host")}/api/v1/callback`;/paytm/callback
  params["CALLBACK_URL"] = `http://localhost:7000/api/order/paytm/callback`;
  params["EMAIL"] = email;
  params["MOBILE_NO"] = phoneNo;

  try {
    let paytmChecksum = await paytm.generateSignature(
      params,
      process.env.PAYTM_MERCHANT_KEY
    );

    let paytmParams = {
      ...params,
      CHECKSUMHASH: paytmChecksum,
    };

    return paytmParams;

    // const checksumdata = await paytmChecksum();

    // console.log("checksumdata",checksumdata)
  } catch (error) {
    console.log("error");
  }

  // paytmChecksum
  //   .then(function (checksum) {
  //     let paytmParams = {
  //       ...params,
  //       CHECKSUMHASH: checksum,
  //     };

  //     console.log("ssss", paytmParams);

  //     // res.status(200).json({
  //     //     paytmParams
  //     // });
  //     return paytmParams;
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });
};

const paytmCallback = (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, file) => {
    var paytmChecksum = fields.CHECKSUMHASH;
    delete fields.CHECKSUMHASH;

    var isVerifySignature = paytm.verifySignature(
      fields,
      process.env.PAYTM_MERCHANT_KEY,
      paytmChecksum
    );
    if (isVerifySignature) {
      var paytmParams = {};
      paytmParams["MID"] = fields.MID;
      paytmParams["ORDERID"] = fields.ORDERID;

      /*
       * Generate checksum by parameters we have
       * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
       */
      paytm
        .generateSignature(paytmParams, process.env.PAYTM_MERCHANT_KEY)
        .then(function (checksum) {
          paytmParams["CHECKSUMHASH"] = checksum;

          var post_data = JSON.stringify(paytmParams);

          var options = {
            /* for Staging */
            // hostname: 'securegw-stage.paytm.in',

            /* for Production */
            hostname: "securegw.paytm.in",

            port: 443,
            path: "/order/status",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": post_data.length,
            },
          };

          var response = "";
          var post_req = https.request(options, function (post_res) {
            post_res.on("data", function (chunk) {
              response += chunk;
            });

            post_res.on("end", function () {
              let result = JSON.parse(response);
              if (result.STATUS === "TXN_SUCCESS") {
                // res.json(result)
                orderSchema
                  .findByIdAndUpdate(
                    result.ORDERID,
                    {
                      $set: {
                        paymentStatus: "Successfull",
                      },
                    },
                    { new: true }
                  )
                  .then(() => console.log("Update success"))
                  .catch(() => console.log("Unable to update"));
              }

              // res.redirect(`https://jdmorgaan.com/status/${result.ORDERID}`)
              res.redirect(
                `http://railingo.rankarts.in/status/${result.ORDERID}`
              );
            });
          });

          post_req.write(post_data);
          post_req.end();
        });
    } else {
      console.log("Checksum Mismatched");
    }

    // let paytmChecksum = req.body.CHECKSUMHASH;
    // delete req.body.CHECKSUMHASH;

    // let paytmChecksum = fields.CHECKSUMHASH;
    // delete fields.CHECKSUMHASH;

    // let isVerifySignature = paytm.verifySignature(
    //   fields,
    //   process.env.PAYTM_MERCHANT_KEY,
    //   paytmChecksum
    // );
    // if (isVerifySignature) {
    //   // console.log("Checksum Matched");

    //   var paytmParams = {};

    //   paytmParams.body = {
    //     mid: fields.MID,
    //     orderId: fields.ORDERID,
    //   };

    //   paytm
    //     .generateSignature(
    //       JSON.stringify(paytmParams.body),
    //       process.env.PAYTM_MERCHANT_KEY
    //     )
    //     .then(function (checksum) {
    //       paytmParams.head = {
    //         signature: checksum,
    //       };

    //       /* prepare JSON string for request */
    //       var post_data = JSON.stringify(paytmParams);

    //       var options = {
    //         /* for Staging */
    //         // hostname: "securegw-stage.paytm.in",

    //         /* for Production */

    //         hostname: "securegw.paytm.in",
    //         port: 443,
    //         path: "/v3/order/status",
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //           "Content-Length": post_data.length,
    //         },
    //       };

    //       // Set up the request
    //       var response = "";
    //       var post_req = https.request(options, function (post_res) {
    //         post_res.on("data", function (chunk) {
    //           response += chunk;
    //         });

    //         post_res.on("end", function () {
    //           let { body } = JSON.parse(response);

    //           console.log("body",body)

    //           // let status = body.resultInfo.resultStatus;
    //           // res.json(body);
    //           // addPayment(body);

    //           console.log("reqqqq", body);
    //           // res.redirect(`${req.protocol}://${req.get("host")}/order/${body.orderId}`)
    //           res.redirect(`http://localhost:5173/orderdetails`);
    //         });
    //       });

    //       // post the data
    //       post_req.write(post_data);
    //       post_req.end();
    //     });
    // } else {
    //   console.log("Checksum Mismatched");
    // }
  });
};

const updateOrderItem = async (req, res, next) => {
  try {
    const orders = await orderSchema.updateOne(
      {
        "orderItems.Installment._id": "6486b563d86ee3928818ad7e",
      },
      {
        $set: {
          "orderItems[0].Installment.[0].paymentstatus": "Hi eeyeyeyy",
          // "orderItems.$[].Installment.$.paymentstatus" : "dddjjjjjjjjjjjjddd"
          // "orderItems.$[].Installment.$.paymentstatus" : "dddjjjjjjjjjjjjddd"
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: orders,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const InstallmentPayment = async (req, res, next) => {
  try {
    const { Amount } = req.body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: Amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: Date.now(),
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });

    // next(handleError(500,error.message))
  }
};

module.exports = {
  deleteorders,
  getorderdetails,
  putorders,
  postorders,
  getorders,
  paytmCallback,
  updateOrderItem,
  InstallmentPayment,
};
