const enquirySchema = require("../modal/Enquiry");
const { handleError } = require("../utils/handleError");
const mail = require("../utils/nodemailer");


const getenquiry = async (req, res, next) => {
  try {
    const enquiry = await enquirySchema.find(req.query?req.query:{});
    res.status(200).json({
      success: true,
      data: enquiry,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};


const postenquiry = async (req, res, next) => {
  try {
    const enquiry = await enquirySchema.create(req.body);

   


   let mailmessage = await mail("mihir@digisidekick.com",JSON.stringify(req.body), "Enquiry Form Railingo")


    res.status(200).json({
      success: true,
      data: enquiry,
      message: "enquiry Created Successfully",
    });
  } catch (error) {

   

    if (error.code === 11000) {
      return next(handleError(500, "Same Coupon Name Already Present"));
    } else {
      next(handleError(500, error.message));
    }

    
  }
};





const putenquiry = async (req, res, next) => {
  try {
    const enquiry = await enquirySchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: enquiry,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getenquirydetails = async (req, res, next) => {
  try {
    const enquiry = await enquirySchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: enquiry,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteenquiry = async (req, res, next) => {
  try {
    const enquiry = await enquirySchema.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "enquiry Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};



module.exports = {
  deleteenquiry,
  getenquirydetails,
  putenquiry,
  postenquiry,
  getenquiry,
};
