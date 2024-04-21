const { handleError } = require("../utils/handleError");

// Import all your schemas
const schemas = {
  collectionSchema: require("../modal/collection"),
  customizeDotProductSchema: require("../modal/customizeDotProductModal"),
  customizeProductCombinationSchema: require("../modal/customizeProductCombinationModal"),
  customizeDotProductImageSchema: require("../modal/customizeDotProductImageModal"),
  customizeComboRectangleModalSchema: require("../modal/customizeComboRectangleModal"),
  customizedComboModelSchema: require("../modal/customizedComboModel"),
  collectionTagSchema: require("../modal/collectionTagModal.js"),
  collectionFilterNewSchema: require("../modal/collectionFilterNewModal.js"),
  AttributeCategorSchema: require("../modal/AttributeCategoryModal"),
  attributeSchema: require("../modal/attributeModal"),
  attributeNewSchema: require("../modal/attributeModalNew"),
  userRoleSchema: require("../modal/userRoleModal"),
  UOMSchema: require("../modal/UOMModal"),
  tagSchema: require("../modal/tagsmodal"),
  singleProductSchema: require("../modal/singleProductModal"),
  singleProductCombinationSchema: require("../modal/singleProductCombinationModal"),
  ProductDescriptionSchema: require("../modal/ProductDescriptionsmodal"),
  positionSchema: require("../modal/positionModal"),
  parameterSchema: require("../modal/parameterModal"),
  positionParameterImageSchema: require("../modal/parameterPositionImageModal"),
  dotProductImageSchema: require("../modal/dotProductImageModal"),
  dotProductSchema: require("../modal/dotProductModalNew"),
};

const checkUserIdExistence = async (req, res, next) => {
  let result;
  const userId = req.params.id;
  try {
    for (const schema of Object.values(schemas)) {
      // console.log("Checking user identity", schema);
      result = await schema.find({
        $or: [{ createdBy: userId }, { updatedBy: userId }],
      });
      if (result.length > 0) {
        break;
      }
    }

    if (result.length > 0) {
      // console.log("Found user with", result);
      res.status(409).json({
        success: true,
        message: "Cannot delete user  referenced in one or more collections",
      });
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    next(handleError(500, error.message));
  }
};

const checkUserCantDelete = async (req, res, next) => {
  const normalUser = req.params.id;
  const logInUser = req.user.id ?? "65d0c9183f4fd9e80be3a2f2";
  console.log("Checking normal user", normalUser);
  console.log("Checking login user", logInUser);
  try {
    if (normalUser.trim().toString() === logInUser.trim().toString()) {
      console.log("user can not delete himself");
      res.status(409).json({
        success: false,
        message: "user can not delete himself",
      });
      return;
    }
    next();
  } catch (error) {
    console.error(error);
    next(handleError(500, error.message));
  }
};

module.exports = {
  checkUserCantDelete,
  checkUserIdExistence,
};
