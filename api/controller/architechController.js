const architechSchema = require("../modal/architechModal");
const { handleError } = require("../utils/handleError");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const getarchitech = async (req, res, next) => {
  try {
    const architech = await architechSchema
      .find(req.query ? req.query : {})
      .populate({
        path: "NormalProducts",
        populate: {
          path: "tags",
        },
      })
      .populate({
        path: "CustomizedProducts",
        populate: [
          {
            path: "tags",
          },
          {
            path: "attribute",
          },
          {
            path: "BackSAF",
          },
          {
            path: "BackCB",
          },
          {
            path: "BackIB",
          },
        ],
      })
      .populate({
        path: "NormalProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      })
      .populate({
        path: "CustomizedProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      });

    res.status(200).json({
      success: true,
      data: architech,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postarchitech = async (req, res, next) => {
  try {
    const architechImage = req.file.filename;

    const architech = await architechSchema.create({
      createdBy: req.user.id,
      updatedBy: req.user.id,
      image: architechImage,
      ...req.body,
    });
    res.status(200).json({
      success: true,
      data: architech,
      message: "architech Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// const putarchitech = async (req, res, next) => {
//   try {
//     const {
//       NormalProducts,
//       CustomizedProducts,
//       NormalProductBundle,
//       CustomizedProductBundle,
//       ...others
//     } = req.body;

//     const query = {};

//     if (NormalProducts) {
//       query.$addToSet = { NormalProducts: { $each: NormalProducts } };
//     }

//     if (NormalProductBundle) {
//       query.$addToSet = { NormalProductBundle: { $each: NormalProductBundle } };
//     }

//     if (CustomizedProducts) {
//       query.$addToSet = { CustomizedProducts: { $each: CustomizedProducts } };
//     }

//     if (CustomizedProductBundle) {
//       query.$addToSet = {
//         CustomizedProductBundle: { $each: CustomizedProductBundle },
//       };
//     }

//     if (others) {
//       query.$set = {
//         updatedBy: req.user.id,
//         ...others,
//       };
//     }

//     const architech = await architechSchema
//       .findByIdAndUpdate(req.params.id, query, {
//         new: true,
//         //Run Validattor method on everyedit
//         runValidators: true,
//       })
//       .populate({
//         path: "NormalProducts",
//         populate: {
//           path: "tags",
//         },
//       })
//       .populate({
//         path: "CustomizedProducts",
//         populate: [
//           {
//             path: "tags",
//           },
//           {
//             path: "attribute",
//           },
//           {
//             path: "BackSAF",
//           },
//           {
//             path: "BackCB",
//           },
//           {
//             path: "BackIB",
//           },
//         ],
//       })
//       .populate({
//         path: "NormalProductBundle",
//         populate: {
//           path: "dots.productId",
//           populate: [
//             {
//               path: "tags",
//             },
//             {
//               path: "attribute",
//             },
//             {
//               path: "BackSAF",
//             },
//             {
//               path: "BackCB",
//             },
//             {
//               path: "BackIB",
//             },
//           ],
//         },
//       })
//       .populate({
//         path: "CustomizedProductBundle",
//         populate: {
//           path: "dots.productId",
//           populate: [
//             {
//               path: "tags",
//             },
//             {
//               path: "attribute",
//             },
//             {
//               path: "BackSAF",
//             },
//             {
//               path: "BackCB",
//             },
//             {
//               path: "BackIB",
//             },
//           ],
//         },
//       });

//     res.status(200).json({
//       success: true,
//       data: architech,
//       message: "Data Updated Successfully",
//     });
//   } catch (error) {
//     next(handleError(500, error.message));
//   }
// };

const putarchitech = async (req, res, next) => {
  try {
    const newData = {
      ...req.body,
    };

    if (req.file) {
      newData.image = req.file.filename;
    }

    const userupdated = await architechSchema.findByIdAndUpdate(req.params.id, {
      $set: newData,
    });

    if (req.file) {
      const imgpath = `images/architect/${userupdated.image}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      data: userupdated,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getArchitechByURL = async (req, res, next) => {};

const getarchitechdetails = async (req, res, next) => {
  try {
    const architech = await architechSchema
      .findById(req.params.id)
      .populate({
        path: "NormalProducts",
        populate: {
          path: "tags",
        },
      })
      .populate({
        path: "CustomizedProducts",
        populate: [
          {
            path: "tags",
          },
          {
            path: "attribute",
          },
          {
            path: "BackSAF",
          },
          {
            path: "BackCB",
          },
          {
            path: "BackIB",
          },
        ],
      })
      .populate({
        path: "NormalProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      })
      .populate({
        path: "CustomizedProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      });

    res.status(200).json({
      success: true,
      data: architech,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deletearchitech = async (req, res, next) => {
  try {
    const architecht = await architechSchema.findByIdAndDelete(req.params.id);

    if (architecht?.image) {
      const imgpath = `images/architect/${architecht.image}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }

    res.status(200).json({
      success: true,
      message: "architech Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const architectlogin = async (req, res, next) => {
  try {
    const architect = await architechSchema
      .findOne(
        {
          Email: req.body.Email,
        },
        { createdAt: false, updatedAt: false, __v: false }
      )
      .populate({
        path: "NormalProducts",
        populate: {
          path: "tags",
        },
      })
      .populate({
        path: "CustomizedProducts",
        populate: [
          {
            path: "tags",
          },
          {
            path: "attribute",
          },
          {
            path: "BackSAF",
          },
          {
            path: "BackCB",
          },
          {
            path: "BackIB",
          },
        ],
      })
      .populate({
        path: "NormalProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      })
      .populate({
        path: "CustomizedProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      });

    if (!architect) {
      next(handleError(401, "User Not Available"));
      return;
    }

    if (architect) {
      if (architect.Password != req.body.Password) {
        next(handleError(401, "Wrong Credentials"));
        return;
      }
    }

    const option = {
      httpOnly: true,
      // maxAge: 1000,
      maxAge: 1 * 60 * 60 * 1000,
    };
    //Genrating Token
    const token = jwt.sign(
      {
        id: architect._id,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const { Password, ...others } = architect._doc;

    res.cookie("token", token, option).send({
      success: true,
      message: "Successfully Login",
      data: {
        ...others,
      },
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const removeProduct = async (req, res, next) => {
  try {
    const {
      NormalProducts,
      CustomizedProducts,
      NormalProductBundle,
      CustomizedProductBundle,
      ...others
    } = req.body;

    if (
      !NormalProducts &&
      !CustomizedProducts &&
      !NormalProductBundle &&
      !CustomizedProductBundle
    ) {
      return next(handleError(404, "Please Provide Field Name"));
    }

    const query = {};

    if (NormalProducts) {
      query.$pull = {
        NormalProducts: NormalProducts,
      };
    }

    if (CustomizedProducts) {
      query.$pull = {
        CustomizedProducts: CustomizedProducts,
      };
    }

    if (NormalProductBundle) {
      query.$pull = {
        NormalProductBundle: NormalProductBundle,
      };
    }

    if (CustomizedProductBundle) {
      query.$pull = {
        CustomizedProductBundle: CustomizedProductBundle,
      };
    }

    const architech = await architechSchema
      .findByIdAndUpdate(req.params.productID, query, { new: true })
      .populate({
        path: "NormalProducts",
        populate: {
          path: "tags",
        },
      })
      .populate({
        path: "CustomizedProducts",
        populate: [
          {
            path: "tags",
          },
          {
            path: "attribute",
          },
          {
            path: "BackSAF",
          },
          {
            path: "BackCB",
          },
          {
            path: "BackIB",
          },
        ],
      })
      .populate({
        path: "NormalProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      })
      .populate({
        path: "CustomizedProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      });

    res.status(200).json({
      success: true,
      data: architech,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const logoutArchitect = async (req, res, next) => {
  try {
    res.clearCookie("token").json({
      success: true,
      message: "USer Logout Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const verifyArchitect = async (req, res, next) => {
  try {
    const architech = await architechSchema
      .findById(req.user)
      .populate({
        path: "NormalProducts",
        populate: {
          path: "tags",
        },
      })
      .populate({
        path: "CustomizedProducts",
        populate: [
          {
            path: "tags",
          },
          {
            path: "attribute",
          },
          {
            path: "BackSAF",
          },
          {
            path: "BackCB",
          },
          {
            path: "BackIB",
          },
        ],
      })
      .populate({
        path: "NormalProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      })
      .populate({
        path: "CustomizedProductBundle",
        populate: {
          path: "dots.productId",
          populate: [
            {
              path: "tags",
            },
            {
              path: "attribute",
            },
            {
              path: "BackSAF",
            },
            {
              path: "BackCB",
            },
            {
              path: "BackIB",
            },
          ],
        },
      });
    res.status(200).json({
      success: true,
      data: architech,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  getarchitech,
  architectlogin,
  postarchitech,
  putarchitech,
  deletearchitech,
  getarchitechdetails,
  removeProduct,
  logoutArchitect,
  verifyArchitect,
  getArchitechByURL,
};
