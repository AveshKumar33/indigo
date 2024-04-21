const catalogueSchema = require("../modal/catalogueModal");
const { handleError } = require("../utils/handleError");
const mail = require("../utils/nodemailer");
const fs = require("fs");
const getcatalogue = async (req, res, next) => {
  try {
    const catalogue = await catalogueSchema.find();
    res.status(200).json({
      success: true,
      data: catalogue,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postcatalogue = async (req, res, next) => {
  try {
    const image = req.files["catalogueimg"][0].filename;
    const pdfUrl = req.files["cataloguepdf"][0].filename;
    const catalogue = await catalogueSchema.create({
      image,
      pdfUrl,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    });

    res.status(200).json({
      success: true,
      data: catalogue,
      message: "catalogue Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(handleError(500, "Same Coupon Name Already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

const putcatalogue = async (req, res, next) => {
  try {
    let newCatalogueData = {
      updatedBy: req.user.id,
      ...req.body,
    };
    if (req.files["catalogueimg"]) {
      const image = req.files["catalogueimg"][0].filename;
      newCatalogueData.image = image;
    }
    if (req.files["cataloguepdf"]) {
      const pdfUrl = req.files["cataloguepdf"][0].filename;
      newCatalogueData.pdfUrl = pdfUrl;
    }

    const catalogue = await catalogueSchema.findByIdAndUpdate(req.params.id, {
      $set: newCatalogueData,
    });
    if (req.files["cataloguepdf"] && catalogue.pdfUrl) {
      const path = `images/catalogue/${catalogue.pdfUrl}`;
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    }
    if (req.files["catalogueimg"] && catalogue.image) {
      const path = `images/catalogue/${catalogue.image}`;
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    }
    res.status(200).json({
      success: true,
      data: catalogue,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getcataloguedetails = async (req, res, next) => {
  try {
    const catalogue = await catalogueSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: catalogue,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deletecatalogue = async (req, res, next) => {
  try {
    const catalogue = await catalogueSchema.findByIdAndDelete(req.params.id);
    if (catalogue.pdfUrl) {
      const path = `images/catalogue/${catalogue.pdfUrl}`;
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    }
    if (catalogue.image) {
      const path = `images/catalogue/${catalogue.image}`;
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    }
    res.status(200).json({
      success: true,
      message: "catalogue Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deletecatalogue,
  getcataloguedetails,
  putcatalogue,
  postcatalogue,
  getcatalogue,
};
