const dotCustomizedProductModal = require("../modal/dotCustomizedModal");
const { handleError } = require("../utils/handleError");

//Check for customized product Availability 

const checkCustomizedProductAvailabilty = async(req,res,next) =>{
    try {

        const productId = req.params.id;

        const productmatch = await dotCustomizedProductModal.find({"dots.productId":productId});

        if(productmatch.length > 0){
            next(handleError(500,`Product Used in ${productmatch[0].name} Bundle `))
            return;
        }

        next();

        
    } catch (error) {
        next(handleError(500, error.message));
        
    }
}


module.exports = {checkCustomizedProductAvailabilty}
