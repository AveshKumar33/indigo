const dotProductModal = require("../modal/dotModal");
const { handleError } = require("../utils/handleError");


const checkDotProductAvailabilty = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const productmatch = await dotProductModal.find({
      "dots.productId": productId,
    });

    if (productmatch.length > 0) {
      next(handleError(500, `Product Used in ${productmatch[0].name} Dot Product Bundle `));
      return;
    }

    next();
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = { checkDotProductAvailabilty };
