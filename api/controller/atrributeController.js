const attributeSchema = require("../modal/attributeModal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");
const productSchema = require("../modal/productmodal");

const getattribute = async (req, res, next) => {
  try {
    const attribute = await attributeSchema
      .find(req.query ? req.query : {})
      .sort({ Display_Index: 1 });
    res.status(200).json({
      success: true,
      data: attribute,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const postattribute = async (req, res, next) => {
  try {
    const attribute = await attributeSchema.create(req.body);
    res.status(200).json({
      success: true,
      data: attribute,
      message: "attribute Created Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const putattribute = async (req, res, next) => {
  try {
    // put option valu

    let {
      Name,
      PrintName,
      OptionsValue,
      enable,
      UOM,
      Display_Index,
      BurgerSque,
    } = req.body;

    let attributeData = {
      Name,
      PrintName,
      enable,
      UOM,
      Display_Index,
      BurgerSque,
    };

    const updateOperation = {};
    if (OptionsValue) {
      updateOperation.$push = { OptionsValue: OptionsValue };
      updateOperation.$set = attributeData;
    } else {
      updateOperation.$set = attributeData;
    }

    const attribute = await attributeSchema.findByIdAndUpdate(
      req.params.id,
      updateOperation,
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      data: attribute,
      message: "Data Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const getattributedetails = async (req, res, next) => {
  try {
    const attribute = await attributeSchema
      .findById(req.params.id)
      .populate("OptionsValue.AttributeCategory", "Name _id");

    res.status(200).json({
      success: true,
      data: attribute,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

const deleteattribute = async (req, res, next) => {
  try {
    const attribute = await attributeSchema.findByIdAndDelete(req.params.id);

    attribute.OptionsValue.map((p, i) => {
      const imgPath1 = `images/product/${p.Photo}`;
      const imgPath2 = `images/product/${p.PNG}`;
      if (fs.existsSync(imgPath1)) {
        fs.unlinkSync(imgPath1);
      }
      if (fs.existsSync(imgPath2)) {
        fs.unlinkSync(imgPath2);
      }
    });

    res.status(200).json({
      success: true,
      message: "attribute Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

// Positions CURD

//get Attribute Item Image
const GetPositionsImages = async (req, res, next) => {
  try {
    const { attributeId } = req.params;

    const updatedattribute = await attributeSchema.findById(
      attributeId,
      "PositionsImages.Name PositionsImages._id"
    );
    res.status(200).json({
      success: true,
      message: "Get Png",
      data: updatedattribute?.PositionsImages ?? [],
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};
const DeletePosition = async (req, res, next) => {
  try {
    const { attributeId, variantId } = req.params;

    const updatedattribute = await attributeSchema.findOneAndUpdate(
      {
        _id: attributeId,
        "PositionsImages._id": variantId,
      },
      { $pull: { PositionsImages: { _id: variantId } } }
    );

    updatedattribute.PositionsImages.map((p) => {
      if (p?.PngPositionsImages.length > 0) {
        p?.PngPositionsImages.map((ele) => {
          if (ele.Png) {
            const imgpath1 = `images/attribute/${ele.Png}`;
            if (fs.existsSync(imgpath1)) {
              fs.unlinkSync(imgpath1);
            }
          }
        });
      }
    });

    await productSchema.updateMany(
      {
        "BackSAFPAQ.AttributeID": attributeId,
        "BackSAFPAQ.PositionGroup": variantId,
      },
      {
        $set: {
          [`BackSAFPAQ.$.PositionGroupName`]: "",
          [`BackSAFPAQ.$.PositionGroup`]: "",
        },
      }
    );
    await productSchema.updateMany(
      {
        "BackCBPAQ.AttributeID": attributeId,
        "BackCBPAQ.PositionGroup": variantId,
      },
      {
        $set: {
          [`BackCBPAQ.$.PositionGroupName`]: "",
          [`BackCBPAQ.$.PositionGroup`]: "",
        },
      }
    );

    await productSchema.updateMany(
      {
        "BackIBPAQ.AttributeID": attributeId,
        "BackIBPAQ.PositionGroup": variantId,
      },
      {
        $set: {
          [`BackIBPAQ.$.PositionGroupName`]: "",
          [`BackIBPAQ.$.PositionGroup`]: "",
        },
      }
    );
    await productSchema.updateMany(
      {
        "attributePosition.AttributeID": attributeId,
        "attributePosition.PositionGroup": variantId,
      },
      {
        $set: {
          [`attributePosition.$.PositionGroupName`]: "",
          [`attributePosition.$.PositionGroup`]: "",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Delete Png",
    });
  } catch (error) {
    console.log("226DeletePosition", error);
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};
const GetPositionsImageVariant = async (req, res, next) => {
  try {
    const { attributeId, variantId } = req.params;

    const updatedattribute = await attributeSchema.findById(attributeId);
    // Find the OptionsValue array element with the given _id
    const PositionsImages = updatedattribute.PositionsImages.find(
      (ov) => ov._id.toString() === variantId
    );
    if (PositionsImages) {
      const pngPositionsImages = PositionsImages.PngPositionsImages;
      const Name = PositionsImages.Name;
      const AttributeName = updatedattribute.Name;
      res.status(200).json({
        success: true,
        message: "Get Png",
        data: { Name, pngPositionsImages, AttributeName },
      });
    }
  } catch (error) {
    console.log(error, "253error");
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};
const editPositionGroupImage = async (req, res, next) => {
  try {
    const { attributeId, variantId, id, index } = req.params;
    await attributeSchema.findOneAndUpdate(
      {
        _id: attributeId,
        [`PositionsImages.${index}.PngPositionsImages._id`]: id,
      },
      {
        $set: {
          [`PositionsImages.${index}.PngPositionsImages.$.Png`]:
            req.file.filename,
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Get Png",
      // data: { Name, pngPositionsImages, AttributeName },
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};
const deletePositionGroupImage = async (req, res, next) => {
  try {
    const { attributeId, variantId, id, index, Name } = req.params;
    const imagePath = `images/attribute/${Name}`;
    await attributeSchema.findOneAndUpdate(
      {
        _id: attributeId,
        [`PositionsImages.${index}.PngPositionsImages._id`]: id,
      },
      {
        $set: {
          [`PositionsImages.${index}.PngPositionsImages.$.Png`]: "",
        },
      },
      { new: true }
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    res.status(200).json({
      success: true,
      message: "image Deleted ",
    });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

//Add Attribute Item Image
const AddPositionsImages = async (req, res, next) => {
  try {
    const { Name } = req.body;

    const { attributeId } = req.params;

    const updatedattribute = await attributeSchema.findById(attributeId);

    let Option = updatedattribute.OptionsValue.map((ele) => {
      return {
        OptionsValueId: ele._id,
        OptionsValueName: ele.Name,
        // Png: ele.PNG,
        Png: "",
      };
    });
    updatedattribute.PositionsImages.push({
      Name: Name,
      PngPositionsImages: Option,
    });

    await updatedattribute.save();
    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};
// //Add Attribute Item Image
// const AddPositionsImages = async (req, res, next) => {
//   try {
//     const { Name } = req.body;

//     console.log(`Adding Attribute running`, req.body);

//     const { attributeId, variantId } = req.params;
//     const obj = { Name };
//     console.log(req.file, "req.file");
//     if (req.file.filename) {
//       obj["Png"] = req.file.filename;
//     }

//     const updatedattribute = await attributeSchema.findOneAndUpdate(
//       { _id: attributeId, "OptionsValue._id": variantId },
//       { $push: { "OptionsValue.$.PngPositionsImages": obj } },
//       { new: true }
//     );

//     console.log(updatedattribute, "check this one");
//     res.status(200).json({
//       success: true,
//       message: "Attribute Added Successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: true,
//       message: error.message,
//     });
//   }
// };

//Add Attribute Item Image
const addattributeItemImage = async (req, res, next) => {
  try {
    const {
      Photo,
      PNG,
      Name,
      AttributePrice,
      AttributeCategory,
      DisplayIndex,
      ChangeThis = false,
    } = req.body;

    if (Photo) {
      let ss = req.file.filename;
    }

    const updatedata = {};
    if (Photo) {
      updatedata[`OptionsValue.$.Photo`] = req.file.filename;
    }
    if (PNG) {
      updatedata[`OptionsValue.$.PNG`] = req.file.filename;
    }
    if (Name) {
      updatedata[`OptionsValue.$.Name`] = Name;
    }
    if (AttributePrice) {
      updatedata[`OptionsValue.$.AttributePrice`] = AttributePrice;
    }
    if (AttributeCategory) {
      updatedata[`OptionsValue.$.AttributeCategory`] = AttributeCategory;
    }
    if (DisplayIndex) {
      updatedata[`OptionsValue.$.DisplayIndex`] = DisplayIndex;
    }

    const updatedattribute = await attributeSchema
      .findOneAndUpdate(
        {
          _id: req.params.attributeid,
          "OptionsValue._id": req.params.id,
        },
        {
          $set: updatedata,
        },
        {
          new: true,
        }
      )
      .populate("OptionsValue.AttributeCategory", "Name _id");

    if (ChangeThis) {
      await productSchema.updateMany(
        {
          "BackSAFPAQ.AttributeID": req.params.attributeid,
          "BackSAFPAQ.SelectedVariant": req.params.id,
        },
        {
          $set: { [`BackSAFPAQ.$.SelectedVariantName`]: Name },
        }
      );
      await productSchema.updateMany(
        {
          "BackCBPAQ.AttributeID": req.params.attributeid,
          "BackCBPAQ.SelectedVariant": req.params.id,
        },
        {
          $set: { [`BackCBPAQ.$.SelectedVariantName`]: Name },
        }
      );

      await productSchema.updateMany(
        {
          "BackIBPAQ.AttributeID": req.params.attributeid,
          "BackIBPAQ.SelectedVariant": req.params.id,
        },
        {
          $set: { [`BackIBPAQ.$.SelectedVariantName`]: Name },
        }
      );
      await productSchema.updateMany(
        {
          "attributePosition.AttributeID": req.params.attributeid,
          "attributePosition.SelectedVariant": req.params.id,
        },
        {
          $set: { [`attributePosition.$.SelectedVariantName`]: Name },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
      data: updatedattribute,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

//Remove Attribute Item Image
const removeattributeItemImage = async (req, res, next) => {
  try {
    const { Photo, PNG } = req.body;

    const updatedata = {};
    if (Photo) {
      updatedata[`OptionsValue.$.Photo`] = "dd";
    }

    if (PNG) {
      updatedata[`OptionsValue.$.PNG`] = "dd";
    }

    const updatedattribute = await attributeSchema.findOneAndUpdate(
      {
        _id: req.params.attributeid,
        "OptionsValue._id": req.params.id,
      },
      { $pull: { OptionsValue: { _id: req.params.id } } }
    );

    updatedattribute.OptionsValue.map((p) => {
      if (p._id == req.params.id && Photo) {
        if (p?.Photo) {
          const imgpath1 = `images/attribute/${p.Photo}`;
          if (fs.existsSync(imgpath1)) {
            fs.unlinkSync(imgpath1);
          }
        }
      }

      if (p._id == req.params.id && PNG) {
        if (p?.PNG) {
          const imgpath1 = `images/attribute/${p.PNG}`;
          if (fs.existsSync(imgpath1)) {
            fs.unlinkSync(imgpath1);
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};
//Remove Attribute Item Image
const removeattributeItemImageData = async (req, res, next) => {
  try {
    const { Photo, PNG } = req.body;

    const updatedata = {};
    if (Photo) {
      updatedata[`OptionsValue.$.Photo`] = "";
    }

    if (PNG) {
      updatedata[`OptionsValue.$.PNG`] = "";
    }

    const updatedattribute = await attributeSchema.findOneAndUpdate(
      {
        _id: req.params.attributeid,
        "OptionsValue._id": req.params.id,
      },
      { $set: updatedata }
    );

    console.log(
      updatedattribute,
      "updatedattributeupdatedattribute",
      updatedata
    );
    updatedattribute.OptionsValue.map((p) => {
      if (p._id == req.params.id && Photo) {
        const imgpath1 = `images/attribute/${p.Photo}`;
        if (fs.existsSync(imgpath1)) {
          fs.unlinkSync(imgpath1);
        }
      }

      if (p._id == req.params.id && PNG) {
        const imgpath1 = `images/attribute/${p.PNG}`;
        if (fs.existsSync(imgpath1)) {
          fs.unlinkSync(imgpath1);
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

//Delete Attribute Item From Attribute
const removeattributeItem = async (req, res, next) => {
  try {
    const updatedattribute = await attributeSchema.findOneAndUpdate(
      {
        _id: req.params.attributeid,
      },
      {
        $pull: {
          OptionsValue: { _id: req.params.id },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
      data: updatedattribute,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

//Add Attribute Item
const addattributeItem = async (req, res, next) => {
  try {
    const updatedattribute = await attributeSchema
      .findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            OptionsValue: {
              Name: req.body.Name,
              AttributePrice: req.body.AttributePrice,
              AttributeCategory: req.body.AttributeCategory,
              DisplayIndex: req.body.DisplayIndex,
            },
          },
        },
        { new: true }
      )
      .populate("OptionsValue.AttributeCategory", "Name _id");

    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
      data: updatedattribute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get attribute Item by Id
const getAttributeItems = async (req, res, next) => {
  try {
    const attribute = await attributeSchema.find({
      _id: { $in: req.body.attributeItems },
    });
    res.status(200).json({
      success: true,
      data: attribute,
      message: "Attribute Item Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

const updateAttributeItems = async (req, res, next) => {
  try {
    const { AttributeItems } = req.body;
    const data = await attributeSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          OptionsValue: AttributeItems,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "AttributeItems Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "AttributeItems not updated Successsfully",
      error,
    });
  }
};

module.exports = {
  deleteattribute,
  getattributedetails,
  putattribute,
  postattribute,
  getattribute,
  addattributeItemImage,
  removeattributeItemImage,
  removeattributeItem,
  addattributeItem,
  getAttributeItems,
  updateAttributeItems,
  removeattributeItemImageData,
  // POSITION CURD
  AddPositionsImages,
  GetPositionsImages,
  GetPositionsImageVariant,
  editPositionGroupImage,
  deletePositionGroupImage,
  DeletePosition,
};
