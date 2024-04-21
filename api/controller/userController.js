const UserSchema = require("../modal/user");
const { handleError } = require("../utils/handleError");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const mail = require("../utils/nodemailer");
const axios = require("axios");

//Get User
const getusers = async (req, res, next) => {
  try {
    const users = await UserSchema.find();
    await UserSchema.updateMany({ isAdmin: false }, { $set: { status: 1 } });

    res.status(200).json({
      success: true,
      data: users,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//Post User
const postusers = async (req, res, next) => {
  try {
    const { Name, Email, MobNumber, Password, status = 1, userRole } = req.body;
    const userImage = req.file.filename;

    const role = JSON.parse(userRole);

    const user = await UserSchema.findOne({ Email });

    if (user) {
      next(handleError(500, "Email Already Exist"));
      return;
    }

    const userdata = new UserSchema({
      Name,
      Email,
      MobNumber,
      Password,
      userImage,
      status,
      userRole: role,
    });
    const saveduser = await userdata.save();

    // const users = await UserSchema.create(req.body);
    res.status(200).json({
      success: true,
      data: saveduser,
      message: "users Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//Put User
const putusers = async (req, res, next) => {
  try {
    const { Name, Email, MobNumber, Password, status, userRole } = req.body;

    const newuserData = {
      Name,
      Email,
      MobNumber,
      Password,
      status,
      userRole,
    };

    if (req.file) {
      newuserData.userImage = req.file.filename;
    }

    const userupdated = await UserSchema.findByIdAndUpdate(req.params.id, {
      $set: newuserData,
    });

    if (req.file) {
      const imgpath = `images/user/${userupdated.userImage}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      //   data: userupdated,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//Get User Details

const getusersdetails = async (req, res, next) => {
  try {
    const users = await UserSchema.findById(req.params.id).populate("userRole");

    res.status(200).json({
      success: true,
      data: users,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//Delete User
const deleteusers = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      console.log("User not  deleted successfully", req.user.id, req.params.id);
    }
    const users = await UserSchema.findByIdAndDelete(req.params.id);

    if (users) {
      const imgpath = `images/user/${users.userImage}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }
    res.status(200).json({
      success: true,
      message: "users Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//User Login
const userlogin = async (req, res, next) => {
  try {
    const user = await UserSchema.findOne(
      {
        Email: req.body.Email,
      },
      { createdAt: false, updatedAt: false, __v: false }
    ).populate("userRole");

    if (!user) {
      next(handleError(401, "User Not Available"));
      return;
    }

    if (user) {
      if (user.Password != req.body.Password) {
        next(handleError(401, "Wrong Credentials"));
        return;
      }
    }

    //Genrating Token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30d" }
    );
    const { Password, ...others } = user._doc;

    res.status(200).json({
      success: true,
      message: "Successfully Login",
      data: {
        ...others,
        token,
      },
    });
    // res.status(200).json({ ...others, token })
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//Otp Sent
const otpSent = async (req, res, next) => {
  try {
    const user = await UserSchema.findOne(
      {
        MobNumber: req.body.MobNumber,
      },
      { createdAt: false, updatedAt: false, __v: false }
    );

    if (!user) {
      next(handleError(401, "User Not Available"));
      return;
    }

    if (user) {
      let otp = generateOtp();

      user.OTP = otp;
      user.otpExpTime = Date.now();

      let mobnumber = user.MobNumber;

      await user.save();

      let mailmessage = await mail(
        user.Email,
        "Your Login Otp is " + otp,
        "Login OTP From Railingo"
      );

      let whatsappmessage = await sentOTPtoWhatsapp(
        "Your Railingo Login OTP is " + otp,
        mobnumber
      );
    }

    res.status(200).json({
      success: true,
      message: "Otp Sent Successfully",
    });
    // res.status(200).json({ ...others, token })
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//Otp Login

const otplogin = async (req, res, next) => {
  try {
    const user = await UserSchema.findOne(
      {
        MobNumber: req.body.MobNumber,
      },
      { createdAt: false, updatedAt: false, __v: false }
    );

    if (!user) {
      next(handleError(401, "User Not Available"));
      return;
    }

    if (user) {
      if (
        user.OTP != req.body.OTP.trim() ||
        Date.now() - user.otpExpTime >= 600000
      ) {
        next(handleError(401, "Invalid OTP or expired"));
        return;
      }
    }

    //Genrating Token
    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30d" }
    );
    const { Password, ...others } = user._doc;

    res.status(200).json({
      success: true,
      message: "Successfully Login",
      data: {
        ...others,
        token,
      },
    });
    // res.status(200).json({ ...others, token })
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const profileController = async (req, res, next) => {
  try {
    const users = await UserSchema.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: users,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const sentOTPtoWhatsapp = async (message, recievernumber) => {
  try {
    const headers = {
      "Content-type": "multipart/form-data",
    };

    let formdata = new FormData();
    formdata.append("username", "marwarisoftware@gmail.com");
    formdata.append("password", "Marwari@#123");
    // formdata.append("username", "Railingo");
    // formdata.append("password", "Test@#123");
    formdata.append("receiverMobileNo", recievernumber);
    formdata.append("message", message);

    const { data } = await axios.post(
      `https://app.messageautosender.com/message/new`,
      formdata
    );

    return data;
  } catch (error) {
    console.log(error.message, "error");
  }
};

const generateOtp = () => {
  return Math.floor(Math.random() * 900000) + 100000;
};

module.exports = {
  deleteusers,
  getusersdetails,
  putusers,
  postusers,
  getusers,
  userlogin,
  profileController,
  otpSent,
  otplogin,
  sentOTPtoWhatsapp,
};
