const userRoleSchema = require("../modal/userRoleModal");
const userSchema = require("../modal/user");

const { handleError } = require("../utils/handleError");

//Get all User role
const getAllUsersRole = async (req, res, next) => {
  try {
    const userRole = await userRoleSchema.find();
    res.status(200).json({
      success: true,
      data: userRole,
      message: "All user roles fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//create  new User role
const createUserRole = async (req, res, next) => {
  try {
    const { name, status } = req.body;
    const userRoledata = new userRoleSchema({
      name,
      status,
    });
    const saveduserRole = await userRoledata.save();
    res.status(201).json({
      success: true,
      data: saveduserRole,
      message: "User role Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//update  User role by id
const updateUserRole = async (req, res, next) => {
  try {
    const { name, status } = req.body;
    const newuserRoleData = {
      name,
      status,
    };
    const userupdated = await userRoleSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: newuserRoleData,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: userupdated,
      message: "User role Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//Get User role Details
const getUserRoleById = async (req, res, next) => {
  try {
    const users = await userRoleSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: users,
      message: "User role Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

//Delete User role by id

const deleteUserById = async (req, res, next) => {
  try {
    const userRoleId = req.params.id;
    const existUserRole = await userSchema.find({
      userRole: { $in: [userRoleId] },
    });
    if (existUserRole.length === 0) {
      const users = await userRoleSchema.findByIdAndDelete(req.params.id);
      res.status(200).json({
        success: true,
        message: "User role Deleted Successfully",
      });
    } else {
      res.status(409).json({
        success: true,
        message: "User role  already assigned",
      });
    }
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  getAllUsersRole,
  createUserRole,
  updateUserRole,
  getUserRoleById,
  deleteUserById,
};
