const raiseAQuerySchema = require("../modal/raiseAQuerySchema");
const fs = require("fs");
// const mail = require("../util/nodeMailer");

const getallService = async (req, res, next) => {
  try {
    const service = await raiseAQuerySchema.find().populate("EquipmentName");
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

const postservice = async (req, res, next) => {
  try {
    await raiseAQuerySchema.create(req.body);
    // const data = await mail({
    //   email: Email,
    //   message: Message,
    //   subject: `Request a Free Call Back ${EnquiryFor ? EnquiryFor : ""}`,
    //   phoneNo: MobNumber,
    //   name: Name,
    // });

    res
      .status(200)
      .json({ success: true, message: "Service Request created successfully" });
  } catch (error) {
    console.log("check error ", error);
    next(error);
  }
};

const putservice = async (req, res, next) => {
  try {
    const service = await raiseAQuerySchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res
      .status(200)
      .json({ success: false, message: "Service Updated Successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteservice = async (req, res, next) => {
  try {
    const service = await raiseAQuerySchema.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Service Request Deleted Successfully" });
  } catch (error) {
    next(error);
  }
};

const servicedetails = async (req, res, next) => {
  try {
    const service = await raiseAQuerySchema.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getallService,
  postservice,
  putservice,
  deleteservice,
  servicedetails,
};
