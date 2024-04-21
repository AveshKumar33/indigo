const productBundleSchema = require("../modal/productbundle");
const { handleError } = require("../utils/handleError");

const getproductBundle = async (req, res, next) => {
  try {
    const productBundle = await productBundleSchema.find(
      req.query ? req.query : {}
    ).populate("products");

    res.status(200).json({
      success: true,
      data: productBundle,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postproductBundle = async (req, res, next) => {
  try {
    let imgdata = [];

    if (req.files) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    const { BundleName, products, url } = req.body;

    const bundledata = {
      BundleName,
      url,
      bundleImage: imgdata,
      products: JSON.parse(products),
    };

    const bundle = new productBundleSchema(bundledata);

    await bundle.save();

    // const productBundle = await productBundleSchema.create(req.body);
    res.status(200).json({
      success: true,
      data: bundle,
      message: "productBundle Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "productBundle already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const putproductBundle = async (req, res, next) => {
  try {

    let imgdata = [];

    if (req.files || req.file) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    const { BundleName, products, url } = req.body;

    const bundledata = {
      BundleName,
      url,
      // bundleImage: imgdata,
      products: JSON.parse(products)
    };
   


    const updateOperation = {};
    if (imgdata?.length !== 0) {
      updateOperation.$push = { bundleImage: imgdata };
      updateOperation.$set = bundledata;
    } else {
      updateOperation.$set = bundledata;
    }

    const productBundle = await productBundleSchema.findByIdAndUpdate(
      req.params.id,
      updateOperation,
      { new: true }
    )

    res.status(200).json({
      success: true,
      data: productBundle,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};



const getproductbundledetails = async (req, res, next) => {
  try {
    const productBundle = await productBundleSchema.findById(req.params.id).populate({
      path:"products",
      populate:{
        path:"attribute"
      }
    })
    res.status(200).json({
      success: true,
      data: productBundle,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};




const deleteproductBundle = async (req, res, next) => {
  try {
    const productBundle = await productBundleSchema.findByIdAndDelete(
      req.params.id
    );
    
    // Delete Image from the Server
    productBundle.bundleImage.map((p, i) => {
      const imgPath = `images/productbundle/${p}`;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    res.status(200).json({
      success: true,
      message: "productBundle Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};


const removeImage = async (req, res) => {
  try {
    await productBundleSchema.findByIdAndUpdate(req.params.id, {
      $pull: { bundleImage: req.params.name },
    })

    //  Image delete fromthe Server
    const deleteimgpath = `images/productbundle/${req.params.name}`;

    fs.unlinkSync(deleteimgpath, (err) => {
      if (err) {
        return res.status(200).json({
          success: true,
          message: "Image Deleted Successfully",
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Image Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};








module.exports = {
  deleteproductBundle,
  getproductbundledetails,
  putproductBundle,
  postproductBundle,
  getproductBundle,
  removeImage,
  
};