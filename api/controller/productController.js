const { nextTick } = require("process");
const productSchema = require("../modal/productmodal");
const { handleError } = require("../utils/handleError");
const attributeSchema = require("../modal/attributeModal");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { ObjectId } = require("mongodb");
// const sharp = require("sharp");
const path = require("path");
const sharp = require("sharp");

const getproduct = async (req, res) => {
  try {
    const product = await productSchema
      .find(req.query ? req.query : {})
      .populate("tags")
      // .populate({
      //   path:"attribute",
      //   match:{enable: true}
      // })
      .populate("attribute")
      .populate({
        path: "FrontAttribute",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackSAF",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackCB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackIB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      });

    res.status(200).json({
      success: true,
      message: "All Product Data Fetched",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const Urlhandle = async (req, res) => {
  try {
    const product = await productSchema
      .find(req.body ? req.body : {})
      .populate("tags")
      .populate("attribute")
      .populate({
        path: "FrontAttribute",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackSAF",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackCB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackIB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "Collection",
        select: {
          title: 1,
          url: 1,
        },
        populate: {
          path: "rootPath",
          select: {
            title: 1,
            url: 1,
          },
        },
      });

    res.status(200).json({
      success: true,
      message: "All Product Data Fetched",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const returnAddOnRemoveOnElement = (dbArr, addedArr) => {
  // console.log("PreviousProduct.attribute,newAttribute",dbArr, addedArr)

  const addedElements = addedArr.filter((item) => !dbArr.includes(item));
  const removedElements = dbArr.filter(
    (item) => !addedArr.includes(item.toString())
  );
  return {
    addedElements,
    removedElements,
  };
};

const removeAllUnselectedAttribute = (attribute, removedElements) => {
  // console.log(attribute, removedElements,"attribute, removedElements")

  const myArr = attribute.filter(
    (item) =>
      !JSON.parse(JSON.stringify(removedElements)).includes(item.AttributeID)
  );
  return myArr;
};

const AddAllSelectedAttribute = async (addedElements, updateTo) => {
  try {
    const attribute = await attributeSchema.find({
      _id: { $in: addedElements },
    });

    const updateNewAttribute = attribute.map((ele) => {
      return {
        Name: ele.Name,
        PositionX: 0,
        PositionY: 0,
        Quantity: 1,
        isShow: true,
        AttributeID: ele._id,
        SelectedVariant: ele.OptionsValue[0]["_id"] ?? "",
        SelectedVariantName: ele.OptionsValue[0]["Name"] ?? "",
      };
    });

    return updateNewAttribute;
  } catch (error) {
    console.log(error, "Check the error message");
  }
};
const removeDuplicateAttribute = async (req, res, next) => {
  try {
    const { attribute } = req.body;
    const PreviousProduct = await productSchema.findById(req.params.id);

    if (PreviousProduct.CustomizedProduct) {
      const newAttribute = JSON.parse(attribute);

      if (newAttribute.length == 0) {
        const fieldsToUpdate = [
          "attributePosition",
          "BackSAFPAQ",
          "BackCBPAQ",
          "BackIBPAQ",
          "BackSAF",
          "BackCB",
          "BackIB",
          "FrontAttribute",
          // "varient",
          "attribute",
        ];
        fieldsToUpdate.map((field) => (PreviousProduct[field] = []));
        await PreviousProduct.save();

        next();
      } else {
        const fieldsToUpdate = [
          "attributePosition",
          "BackSAFPAQ",
          "BackCBPAQ",
          "BackIBPAQ",
        ];
        const { addedElements, removedElements } = returnAddOnRemoveOnElement(
          PreviousProduct.attribute,
          newAttribute
        );

        if (removedElements.length > 0) {
          fieldsToUpdate.map((field) => {
            PreviousProduct[field] = removeAllUnselectedAttribute(
              PreviousProduct[field],
              removedElements
            );

            // console.log(data, " datadata 150");
          });
        }
        if (addedElements.length > 0) {
          const updateNewAttribute = await AddAllSelectedAttribute(
            addedElements
          );

          fieldsToUpdate.map(
            (field) =>
              (PreviousProduct[field] = [
                ...PreviousProduct[field],
                ...updateNewAttribute,
              ])
          );
        }

        await PreviousProduct.save();
        next();
        // res.status(200).json({
        //   success: true,
        //   message: "Product Successfully Updated",
        //   // data: PreviousProduct,
        // });
      }
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

const postproduct = async (req, res, next) => {
  try {
    let imgdata = [];

    if (req.files) {
      req?.files?.map((m) => imgdata.push(m.filename));
    }

    let {
      ProductName,
      ProductDescription,
      FeaturedProduct,
      tags,
      SalePrice,
      OriginalPrice,
      ProductStatus,
      ProductInStockQuantity,
      SKU,
      Barcode,
      Urlhandle,
      SeoProductTitle,
      SeoMetaDesc,
      Installment,
      SellingType,
      attribute,
      GSTIN,
      CustomizedProduct,
      FixedPrice,
      BackSAF,
      BackCB,
      BackIB,
      FixedPriceSAF,
      FixedPriceCB,
      FixedPriceIB,
      Collection,
      CollectionChild,
      DefaultWidth,
      MinWidth,
      MaxWidth,
      DefaultHeight,
      MinHeight,
      MaxHeight,
      InstallmentAmount,
      Wastage,
    } = req.body;

    let productdata = {
      ProductName,
      ProductDescription,
      FeaturedProduct,
      tags,
      // SalePrice,
      // OriginalPrice,
      ProductStatus,
      ProductInStockQuantity,
      SKU,
      Barcode,
      Urlhandle,
      SeoProductTitle,
      SeoMetaDesc,
      ProductImage: imgdata,
      tags: JSON.parse(tags),
      Installment: JSON.parse(Installment),
      attribute: JSON.parse(attribute),
      SellingType,
      GSTIN,
      Collection,
      DefaultWidth,
      MinWidth,
      MaxWidth,
      DefaultHeight,
      MinHeight,
      MaxHeight,
      InstallmentAmount,
      Wastage,
    };

    if (CustomizedProduct) {
      productdata.CustomizedProduct = true;
    }

    if (FixedPrice) {
      productdata.FixedPrice = FixedPrice;
    }

    if (SalePrice) {
      productdata.SalePrice = SalePrice;
    }

    if (OriginalPrice) {
      productdata.OriginalPrice = OriginalPrice;
    }

    if (BackIB) {
      productdata["BackIB"] = JSON.parse(BackIB);
    }
    if (CollectionChild) {
      productdata["CollectionChild"] = JSON.parse(CollectionChild);
    }

    if (BackSAF) {
      productdata["BackSAF"] = JSON.parse(BackSAF);
    }

    if (BackCB) {
      productdata["BackCB"] = JSON.parse(BackCB);
    }

    if (FixedPriceSAF) {
      productdata["FixedPriceSAF"] = FixedPriceSAF;
    }

    if (FixedPriceCB) {
      productdata["FixedPriceCB"] = FixedPriceCB;
    }
    if (FixedPriceIB) {
      productdata["FixedPriceIB"] = FixedPriceIB;
    }

    let product = new productSchema(productdata);

    // Check for CoverBack and IgnoreBack

    if (product.BackSAF.length !== 0) {
      product = await product.populate("BackSAF");

      product.BackSAFPAQ = product.BackSAF.map((p) => {
        return {
          Name: p.Name,
          PositionX: 0,
          PositionY: 0,
          Quantity: 1,
          AttributeID: p._id,
        };
      });
    }

    if (product.BackCB.length !== 0) {
      product = await product.populate("BackCB");

      product.BackCBPAQ = product.BackCB.map((p) => {
        return {
          Name: p.Name,
          PositionX: 0,
          PositionY: 0,
          Quantity: 1,
          AttributeID: p._id,
        };
      });
    }

    if (product.BackIB.length !== 0) {
      product = await product.populate("BackIB");

      product.BackIBPAQ = product.BackIB.map((p) => {
        return {
          Name: p.Name,
          PositionX: 0,
          PositionY: 0,
          Quantity: 1,
          AttributeID: p._id,
        };
      });
    }

    await product.save();

    if (product.attribute.length !== 0) {
      let populateddata = await product.populate("attribute");

      //Setting the Position of Attribute Item

      populateddata.attributePosition = populateddata.attribute.map((p) => {
        return {
          Name: p.Name,
          PositionX: 0,
          PositionY: 0,
          Quantity: 1,
          AttributeID: p._id,
        };
      });

      let varient = [];

      function generateCombinations(
        array,
        index = 0,
        currentCombination = [],
        combinations = []
      ) {
        if (index === array.length) {
          combinations.push({ ...currentCombination });

          return;
        }

        const currentItem = array[index].OptionsValue;

        for (let i = 0; i < currentItem.length; i++) {
          //For Adding Value
          // currentCombination[array[index].Name] = currentItem[i]._id;

          //For Adding Name
          currentCombination[array[index].Name] = currentItem[i].Name;

          generateCombinations(
            array,
            index + 1,
            currentCombination,
            combinations
          );

          delete currentCombination[array[index].Name];

          // currentCombination[index] = {
          //   name: array[index].Name,
          //   item: currentItem[i].Name
          // };

          // generateCombinations(array, index + 1, currentCombination, combinations);
        }

        return combinations;
      }

      if (product.attribute) {
        const allCombinations = generateCombinations(product.attribute);

        // populateddata.varient = allCombinations;
        if (allCombinations) {
          populateddata.varient = allCombinations?.map((p, i) => {
            return {
              //Return all the varient of products
              images: [],
              OriginalPrice: populateddata.OriginalPrice,
              ProductInStockQuantity: populateddata.ProductInStockQuantity,
              ...p,
              i,
            };
          });
        }
      }

      await populateddata.save();
    }

    res.status(200).json({
      success: true,
      message: "All Product Data Fetched",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      // return next(handleError(500, "Same Product Url Already Present"));
    } else {
      next(handleError(500, error.message));
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const putProduct = async (req, res) => {
  try {
    let imgdata = [];
    if (req.files || req.file) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    let {
      ProductName,
      ProductDescription,
      FeaturedProduct,
      tags,
      SalePrice,
      OriginalPrice,
      ProductStatus,
      ProductInStockQuantity,
      SKU,
      Barcode,
      Urlhandle,
      SeoProductTitle,
      SeoMetaDesc,
      Installment,
      GSTIN,
      SellingType,
      attribute,
      CustomizedProduct,
      FixedPrice,
      BackSAF,
      BackCB,
      BackIB,
      FrontAttribute,
      FixedPriceSAF,
      FixedPriceCB,
      FixedPriceIB,
      RequestForPrice,
      Collection,
      CollectionChild,
      DefaultWidth,
      MinWidth,
      MaxWidth,
      DefaultHeight,
      MinHeight,
      MaxHeight,
      InstallmentAmount,
      Wastage,
      ShowSAF,
      ShowIB,
      ShowCB,
    } = req.body;

    let productdata = {
      ProductName,
      ProductDescription,
      FeaturedProduct,
      tags,
      ProductStatus,
      ProductInStockQuantity,
      SKU,
      Barcode,
      Urlhandle,
      SeoProductTitle,
      SeoMetaDesc,
      tags: JSON.parse(tags),
      Installment: JSON.parse(Installment),
      attribute: JSON.parse(attribute),
      SellingType,
      GSTIN,
      RequestForPrice,
      Collection,
      DefaultWidth,
      MinWidth,
      MaxWidth,
      DefaultHeight,
      MinHeight,
      MaxHeight,
      InstallmentAmount,
      Wastage,
      ShowSAF,
      ShowIB,
      ShowCB,
    };

    if (CustomizedProduct) {
      productdata.CustomizedProduct = true;
    }

    if (CollectionChild) {
      productdata["CollectionChild"] = JSON.parse(CollectionChild);
    }
    if (FixedPrice) {
      productdata.FixedPrice = FixedPrice;
    }

    if (SalePrice) {
      productdata.SalePrice = SalePrice;
    }

    if (RequestForPrice) {
      productdata.RequestForPrice = RequestForPrice;
    } else {
      productdata.RequestForPrice = false;
    }
    if (OriginalPrice) {
      productdata.OriginalPrice = OriginalPrice;
    }
    if (FixedPriceSAF) {
      productdata["FixedPriceSAF"] = FixedPriceSAF;
    }
    if (FixedPriceCB) {
      productdata["FixedPriceCB"] = FixedPriceCB;
    }
    if (FixedPriceIB) {
      productdata["FixedPriceIB"] = FixedPriceIB;
    }

    const updateOperation = {};
    if (imgdata?.length !== 0) {
      updateOperation.$push = { ProductImage: imgdata };
      updateOperation.$set = productdata;
    } else {
      updateOperation.$set = productdata;
    }

    const previousproduct = await productSchema.findById(req.params.id);

    const compareArrays = (a, b) =>
      a.length === b.length &&
      a.every((element, index) => {
        let first = element.toString();
        if (first.localeCompare(b[index]) === 0) {
          return true;
        } else {
          return false;
        }
      });

    let comaparearray = compareArrays(
      previousproduct.attribute,
      JSON.parse(attribute)
    );

    let product;

    try {
      product = await productSchema
        .findByIdAndUpdate(req.params.id, updateOperation, { new: true })
        // .findByIdAndUpdate(req.params.id, updateOperation, { returnNewDocument:"after" })
        .populate("attribute")
        .populate({
          path: "FrontAttribute",
          populate: {
            path: "OptionsValue.AttributeCategory",
            select: {
              Name: 1,
            },
          },
        })
        .populate({
          path: "BackSAF",
          populate: {
            path: "OptionsValue.AttributeCategory",
            select: {
              Name: 1,
            },
          },
        })
        .populate({
          path: "BackCB",
          populate: {
            path: "OptionsValue.AttributeCategory",
            select: {
              Name: 1,
            },
          },
        })
        .populate({
          path: "BackIB",
          populate: {
            path: "OptionsValue.AttributeCategory",
            select: {
              Name: 1,
            },
          },
        });
    } catch (error) {
      console.log(error, "check this error");
    }

    const returnMysequences = (attribute, mySetUpArray) => {
      let result = attribute.filter((element) =>
        mySetUpArray.includes(element)
      );

      return result;
    };

    if (!comaparearray) {
      const newAttribute = JSON.parse(attribute);
      const front = product.attributePosition
        .filter((ele) => ele.isShow === true)
        .map((ele) => ele.AttributeID);
      const SAF = product.BackSAFPAQ.filter((ele) => ele.isShow === true).map(
        (ele) => ele.AttributeID
      );
      const CB = product.BackCBPAQ.filter((ele) => ele.isShow === true).map(
        (ele) => ele.AttributeID
      );
      const IB = product.BackIBPAQ.filter((ele) => ele.isShow === true).map(
        (ele) => ele.AttributeID
      );

      let FrontAttribute = returnMysequences(newAttribute, front);
      let BackSAF = returnMysequences(newAttribute, SAF);
      let BackCB = returnMysequences(newAttribute, CB);
      let BackIB = returnMysequences(newAttribute, IB);

      await productSchema.findByIdAndUpdate(req.params.id, {
        $set: {
          FrontAttribute: FrontAttribute,
          BackSAF: BackSAF,
          BackCB: BackCB,
          BackIB: BackIB,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Product Successfully Updated",
      data: product,
    });
  } catch (error) {
    console.log(error, "check this error");
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadVideo = async (req, res) => {
  try {
    let imgdata = [];
    if (req.files || req.file) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    await productSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: { ProductVideo: imgdata },
      },
      { new: true }
    );
    return res.status(500).json({
      success: true,
      // message: error.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getproductdetails = async (req, res) => {
  try {
    const product = await productSchema
      .findById(req.params.id)
      .populate("tags")
      .populate("attribute")
      .populate({
        path: "FrontAttribute",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackSAF",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackCB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackIB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate("Collection", {
        title: 1,
      });

    res.status(200).json({
      success: true,
      data: product,
      message: "Product Details Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteproduct = async (req, res) => {
  try {
    const product = await productSchema.findByIdAndDelete(req.params.id);

    product.ProductImage.map((p, i) => {
      const imgPath = `images/product/${p}`;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeImage = async (req, res) => {
  try {
    await productSchema
      .findByIdAndUpdate(req.params.id, {
        $pull: { ProductImage: req.params.name },
      })
      .populate("attribute");

    //  Image delete fromthe Server
    const deleteimgpath = `images/product/${req.params.name}`;
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
const removeVideo = async (req, res) => {
  try {
    await productSchema
      .findByIdAndUpdate(req.params.id, {
        $pull: { ProductVideo: req.params.name },
      })
      .populate("attribute");

    //  Image delete fromthe Server
    const deleteimgpath = `video/ProductVideo/${req.params.name}`;
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

const findproductbytags = async (req, res, next) => {
  try {
    let products = await productSchema.find({
      tags: { $in: req.body.tags },
    });

    res.status(200).json({
      success: true,
      data: products,
      message: "Product Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Add Attribute
const addattribute = async (req, res, next) => {
  try {
    //Upadate Product with attribute Items

    // await productSchema.update(
    //   {},
    //   { $set: { "varient.$[].Display": true} }
    // );
    const updatedproduct = await productSchema
      .findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: {
            attribute: req.body,
          },
        },
        { new: true }
      )
      .populate("attribute");

    //Create all the possible varient

    // const productdata = await productSchema.findById(req.params.id);

    let allvarient = [];

    let productattribute = updatedproduct.attribute;

    if (productattribute) {
      let productvarrient = productattribute.map((p) => {
        return {
          [p.attributeName]: p.attributeItems,
        };
      });

      const combinations = generateCombinations(productvarrient);

      allvarient = combinations.map((p, i) => {
        return {
          //Return all the varient of products
          images: updatedproduct.ProductImage,
          OriginalPrice: updatedproduct.OriginalPrice,
          ProductInStockQuantity: updatedproduct.ProductInStockQuantity,
          ...p,
          i,
        };
      });
    }

    //After creating All the varient Upload to the server
    const updatedvarient = await productSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          varient: allvarient,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
      data: updatedvarient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeattribute = async (req, res, next) => {
  try {
    //Find image for all the varient and delete images

    //Remove Attribute
    const updatedproduct = await productSchema
      .findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            attribute: {
              attributeName: req.params.name,
            },
          },
        },
        { new: true }
      )
      .populate("attribute");

    // create possible Attribute

    let allvarient = [];

    let productattribute = updatedproduct.attribute;

    if (productattribute) {
      let productvarrient = productattribute.map((p, i) => {
        return {
          [p.attributeName]: p.attributeItems,
        };
      });

      const combinations = generateCombinations(productvarrient);

      allvarient = combinations.map((p, i) => {
        return {
          //Return all the varient of products
          images: updatedproduct.ProductImage,
          OriginalPrice: updatedproduct.OriginalPrice,
          ProductInStockQuantity: updatedproduct.ProductInStockQuantity,
          ...p,
          i,
        };
      });
    }

    //After creating All the varient Upload to the server
    const updatedvarient = await productSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          varient: allvarient,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
      data: updatedvarient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Add Attribute Item
const addattributeItem = async (req, res, next) => {
  try {
    // const updatedproduct = await productSchema.updateMany({
    //   "attribute._id":req.params.id
    // },{
    //   $push:{"attribute.$[].attributeItems":req.params.name}
    // });

    const updatedproduct = await productSchema
      .findOneAndUpdate(
        {
          "attribute._id": req.params.id,
        },
        {
          $push: { "attribute.$.attributeItems": req.params.name },
        },
        { new: true }
      )
      .populate("attribute");

    let allvarient = [];

    let productattribute = updatedproduct.attribute;

    if (productattribute) {
      let productvarrient = productattribute.map((p) => {
        return {
          [p.attributeName]: p.attributeItems,
        };
      });

      const combinations = generateCombinations(productvarrient);

      allvarient = combinations.map((p, i) => {
        return {
          //Return all the varient of products
          images: updatedproduct.ProductImage,
          OriginalPrice: updatedproduct.OriginalPrice,
          ProductInStockQuantity: updatedproduct.ProductInStockQuantity,
          ...p,
          i,
        };
      });
    }

    //After Updating Product Save to the database
    updatedproduct.varient = allvarient;

    await updatedproduct.save();

    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
      data: updatedproduct,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

//Remove Attribute Item
const removeattributeItem = async (req, res, next) => {
  try {
    // const updatedproduct = await productSchema.updateMany({
    //   "attribute._id":req.params.id
    // },{
    //   $pull:{"attribute.$[].attributeItems":req.params.name}
    // },{new:true});

    const updatedproduct = await productSchema
      .findOneAndUpdate(
        {
          "attribute._id": req.params.id,
        },
        {
          $pull: { "attribute.$.attributeItems": req.params.name },
        },
        { new: true }
      )
      .populate("attribute");

    let allvarient = [];

    let productattribute = updatedproduct.attribute;

    if (productattribute) {
      let productvarrient = productattribute.map((p) => {
        return {
          [p.attributeName]: p.attributeItems,
        };
      });

      const combinations = generateCombinations(productvarrient);

      allvarient = combinations.map((p, i) => {
        return {
          //Return all the varient of products
          images: updatedproduct.ProductImage,
          OriginalPrice: updatedproduct.OriginalPrice,
          ProductInStockQuantity: updatedproduct.ProductInStockQuantity,
          ...p,
          i,
        };
      });
    }

    //After Updating Product Save to the database
    updatedproduct.varient = allvarient;

    await updatedproduct.save();

    res.status(200).json({
      success: true,
      message: "Attribute Added Successfully",
      data: updatedproduct,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

// Update Varient on the basis of price and quantity
const updatevarient = async (req, res, next) => {
  try {
    const { key, value, index } = req.body;

    //Update product based on key value
    let updatequery = {};
    updatequery[`varient.$.${key}`] = value;

    const updatedproduct = await productSchema
      .findOneAndUpdate(
        {
          _id: req.params.id,
          "varient.i": index,
        },
        updatequery,
        { new: true }
      )
      .populate("attribute")
      .populate("tags");

    res.status(200).json({
      success: true,
      message: "Updated Successfully",
      data: updatedproduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// updatevarient MULTY PAL
const updatevarientMulti = async (req, res, next) => {
  try {
    const { updateObj = {}, index = [] } = req.body;

    for (const key in updateObj) {
      if (!updateObj[key]) {
        delete updateObj[key];
      }
    }

    const { varient } = await productSchema.findById(req.params.id, {
      varient: 1,
    });

    for (let ind = 0; ind < index.length; ind++) {
      const varientIndex = varient.findIndex((v) => v.i === index[ind]);

      if (varientIndex >= 0) {
        varient[varientIndex] = {
          ...varient[varientIndex],
          ...updateObj,
        };
      }
    }

    const updatedproduct = await productSchema
      .findByIdAndUpdate(
        req.params.id,
        {
          varient,
        },
        { new: true }
      )
      .populate("attribute")
      .populate("tags");

    res.status(200).json({
      success: true,
      message: "Updated Successfully",
      data: updatedproduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateDefaultValue = async (req, res, next) => {
  try {
    // await productSchema.findOneAndUpdate(
    //   { _id: req.params.id },
    //   {
    //     $set: {
    //       "variants.$[].default": false,
    //     },
    //   }
    // );

    await productSchema.updateMany(
      { _id: req.params.id },
      { $set: { "varient.$[].default": false } }
    );

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadVarientImage = async (req, res, next) => {
  try {
    const { index } = req.body;

    let imgdata = [];

    if (req.files) {
      req.files.map((m) => imgdata.push(m.filename));
    }

    const updatedproduct = await productSchema
      .findOneAndUpdate(
        {
          _id: req.params.id,
          "varient.i": Number(index),
        },
        {
          $push: {
            "varient.$.images": { $each: imgdata },
          },
        },
        { new: true }
      )
      .populate("attribute");

    res.status(200).json({
      success: true,
      message: "Image Uploaded Successfully",
      data: updatedproduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVarientImage = async (req, res, next) => {
  try {
    const { index, imgname } = req.body;

    const updatedproduct = await productSchema
      .findOneAndUpdate(
        {
          _id: req.params.id,
          "varient.i": index,
        },
        {
          $pull: {
            "varient.$.images": imgname,
          },
        },
        { new: true }
      )
      .populate("attribute");

    res.status(200).json({
      success: true,
      message: "Image Uploaded Successfully",
      data: updatedproduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Filtered Product
const getfilteredProduct = async (req, res, next) => {
  try {
    const { minprice, maxprice, tags } = { ...req.query };

    const filter = {};

    if (minprice || maxprice) {
      if (minprice && maxprice) {
        filter.OriginalPrice = { $gte: minprice, $lte: maxprice };
      } else if (minprice) {
        filter.OriginalPrice = { $gte: minprice };
      } else {
        filter.OriginalPrice = { $lte: maxprice };
      }
    }

    if (tags) {
      if (Array.isArray(tags)) {
        filter.tags = { $in: tags };
      } else {
        filter.tags = [tags];
      }
    }

    for (const key in req.query) {
      if (key.startsWith("v")) {
        filter[key] = req.query[key];
      }
    }

    const products = await productSchema.find({ ...filter });

    res.status(200).json({
      success: true,
      message: "filtered Product Fetched Successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get all the possible combination of varient
function generateCombinations(objs, currentIndex = 0, currentCombination = {}) {
  if (currentIndex === objs.length) {
    return [currentCombination];
  }

  const currentObject = objs[currentIndex];
  const keys = Object.keys(currentObject);

  const combinations = [];

  for (const key of keys) {
    const values = currentObject[key];
    for (const value of values) {
      const newCombination = { ...currentCombination, [key]: value };
      const remainingCombinations = generateCombinations(
        objs,
        currentIndex + 1,
        newCombination
      );
      combinations.push(...remainingCombinations);
    }
  }

  return combinations;
}

const getpopulatevarientdata = async (req, res, next) => {
  try {
    const getpopulatedadata = await productSchema
      .aggregate([
        {
          $lookup: {
            from: "attributemodals",
            localField: "products.varient.Size",
            foreignField: "attributemodals.OptionsValue._id",
            as: "itemsData",
          },
        },
      ])
      .populate("attribute");

    res.status(200).json({
      success: true,
      data: getpopulatedadata,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      data: error,
    });
  }
};

const updateData = async (req, res, next) => {
  try {
    const updatedvarient = await productSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Varient Position Changed Successfully",
      data: updatedvarient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changevarientposition = async (req, res, next) => {
  try {
    const { firstposition, secondposition } = req.body;

    const previousvarient = await productSchema.findById(req.params.id);
    let firstobject = previousvarient.varient[firstposition];
    let secondobject = previousvarient.varient[secondposition];

    let query = {};
    query[`varient.${firstposition}`] = secondobject;
    query[`varient.${secondposition}`] = firstobject;
    const updatedvarient = await productSchema
      .findByIdAndUpdate(
        req.params.id,
        {
          $set: query,
        },
        { new: true }
      )
      .populate("attribute");

    res.status(200).json({
      success: true,
      message: "Varient Position Changed Successfully",
      data: updatedvarient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

function generatePossibleCombinations(
  array,
  index = 0,
  currentCombination = [],
  combinations = []
) {
  if (index === array.length) {
    combinations.push({ ...currentCombination });
    return;
  }

  const currentItem = array[index].OptionsValue;

  for (let i = 0; i < currentItem.length; i++) {
    //For Adding Value
    // currentCombination[array[index].Name] = currentItem[i]._id;

    //For Adding Name
    currentCombination[array[index].Name] = currentItem[i].Name;

    generateCombinations(array, index + 1, currentCombination, combinations);

    delete currentCombination[array[index].Name];

    // currentCombination[index] = {
    //   name: array[index].Name,
    //   item: currentItem[i].Name
    // };

    // generateCombinations(array, index + 1, currentCombination, combinations);
  }

  return combinations;
}

function areArraysOfObjectsEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false; // If the arrays have different lengths, they cannot be equal.
  }

  // Helper function to compare two objects
  function compareObjects(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false; // If the objects have different numbers of keys, they cannot be equal.
    }

    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false; // If any key-value pair is different, the objects are not equal.
      }
    }

    return true; // All key-value pairs are equal.
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!compareObjects(arr1[i], arr2[i])) {
      return false; // If any object in the arrays is not equal, the arrays are not equal.
    }
  }

  return true; // All objects in the arrays are equal.
}

const updateVarientList = async (req, res, next) => {
  try {
    const { updatedVarient } = req.body;

    const data = await productSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          varient: updatedVarient,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "List Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
    });
  }
};

const upadteAttributePosition = async (req, res, next) => {
  try {
    const { PositionX, PositionY, Quantity } = req.body;

    const updateddata = {};

    if (PositionX) {
      updateddata[`attributePosition.$.PositionX`] = PositionX;
    }

    if (PositionY) {
      updateddata[`attributePosition.$.PositionY`] = PositionY;
    }

    if (Quantity) {
      updateddata[`attributePosition.$.Quantity`] = Quantity;
    }

    const data = await productSchema
      .findOneAndUpdate(
        {
          _id: req.params.id,
          "attributePosition._id": req.params.attributePositionid,
        },
        {
          $set: updateddata,
        },
        { new: true }
      )
      .populate("attribute")
      .populate("tags");

    res.status(200).json({
      success: true,
      message: "Position Updated SuccessFully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error,
    });
  }
};

//Update Attribute Back Position

const upadteAttributeBackPosition = async (req, res, next) => {
  try {
    const { PositionX, PositionY, Quantity, BackName } = req.body;

    const updateddata = {};

    if (PositionX) {
      updateddata[`${BackName}.$.PositionX`] = PositionX;
    }

    if (PositionY) {
      updateddata[`${BackName}.$.PositionY`] = PositionY;
    }

    if (Quantity) {
      updateddata[`${BackName}.$.Quantity`] = Quantity;
    }

    const productmatch = {
      _id: req.params.id,
      [`${BackName}._id`]: req.params.attributeBackPositionid,
    };

    const data = await productSchema
      .findOneAndUpdate(
        productmatch,
        // {
        //   _id: req.params.id,
        //   "attributePosition._id": req.params.attributePositionid,
        // },
        {
          $set: updateddata,
        },
        { new: true }
      )
      .populate("attribute")
      .populate({
        path: "FrontAttribute",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackSAF",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackCB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackIB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate("tags");

    res.status(200).json({
      success: true,
      message: "Position Updated SuccessFully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error,
    });
  }
};

// Image Genration Through Sharp Library

// const genrateimagethroughApi = async (req, res, next) => {
//   try {
//     const { Images } = req.body;

//     let layers = [];

//     const images = Images.map((m) => {
//       layers.push(path.join(__dirname, "../images/attribute", m.PNG));
//     });

//     layers = layers.map((file, i) => {
//       let position = Images[i];

//       return { input: file, top: position.positiony, left: position.positionx };
//       // return  { input: file } ;
//     });

//     const data = await sharp(layers[0].input).composite(layers).toBuffer();

//     const combinedImageBase64 = `data:image/png;base64,${data.toString(
//       "base64"
//     )}`;

//     res.status(200).json({
//       success: true,
//       message: "Image Genrated Successfully",
//       // data: combinedImageBase64,
//       data: data.toString("base64"),
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error,
//     });
//   }
// };

const setImageToVarient = async () => {
  try {
    let productdata = await productSchema.findById(req.params.id);

    // const data = productSchema.findByIdAndRemove(req.params.id,{

    // })
  } catch (error) {}
};

const getproductvarientSameasFront = async (req, res) => {
  try {
    const { IgnoreBack, CoverBack, SameAsFront } = req.body;

    const getproduct = await productSchema.findById(req.params.id);

    let sameasfront, coverback, backignore, FrontAttribute;

    if (getproduct.FrontAttribute.length > 0) {
      FrontAttribute = await getproduct.populate("FrontAttribute");
    }
    if (SameAsFront && getproduct.BackSAF.length > 0) {
      sameasfront = await getproduct.populate("BackSAF");
    }

    if (CoverBack && getproduct.BackCB.length > 0) {
      coverback = await getproduct.populate("BackCB");
    }

    if (IgnoreBack && getproduct.BackIB.length > 0) {
      backignore = await getproduct.populate("BackIB");
    }

    let allCombinationssaf,
      allCombinationscb,
      allCombinationsib,
      allCombinationsFront;

    if (FrontAttribute) {
      allCombinationsFront = genratePossibleCombination(
        sameasfront.FrontAttribute
      );
    }
    if (SameAsFront && sameasfront) {
      allCombinationssaf = genratePossibleCombination(sameasfront.BackSAF);
    }

    if (CoverBack && sameasfront) {
      allCombinationscb = genratePossibleCombination(sameasfront.BackCB);
    }

    if (IgnoreBack && sameasfront) {
      allCombinationsib = genratePossibleCombination(sameasfront.BackIB);
    }

    res.status(200).json({
      success: true,
      data: {
        allCombinationssaf,
        allCombinationsib,
        allCombinationscb,
        allCombinationsFront,
      },
      message: "Genreated Product Varient Successfully",
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: error,
      message: "Genreated Product Varient Successfully",
    });
  }
};
const getproductvarientFront = async (req, res) => {
  try {
    const getproduct = await productSchema.findById(req.params.id);

    let FrontAttribute;

    if (getproduct.FrontAttribute.length > 0) {
      FrontAttribute = await getproduct.populate("FrontAttribute");
    }

    let allCombinationsFront;

    if (FrontAttribute) {
      allCombinationsFront = genratePossibleCombination(
        sameasfront.FrontAttribute
      );
    }

    res.status(200).json({
      success: true,
      data: {
        allCombinationsFront,
      },
      message: "Genreated Product Varient Successfully",
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: error,
      message: "Genreated Product Varient Successfully",
    });
  }
};

const fullTextSearchFunctionality = async (req, res, next) => {
  try {
    let product = await productSchema.find({
      ProductName: { $regex: req.params.productname, $options: "i" },
    });

    res.status(200).json({
      success: true,
      message: "Product Fetched Successfully",
      data: product,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
      data: product,
    });
  }
};

const getwhislist = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    let product = await productSchema.find({
      _id: { $in: productIds },
    });

    res.status(200).json({
      success: true,
      message: "Product Fetched Successfully",
      data: product,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
      data: product,
    });
  }
};

const genratePossibleCombination = (
  array,
  index = 0,
  currentCombination = [],
  combinations = []
) => {
  if (index === array.length) {
    combinations.push({ ...currentCombination });
    return;
  }

  const currentItem = array[index].OptionsValue;

  for (let i = 0; i < currentItem.length; i++) {
    currentCombination[array[index].Name] = currentItem[i].Name;

    genratePossibleCombination(
      array,
      index + 1,
      currentCombination,
      combinations
    );

    delete currentCombination[array[index].Name];
  }

  return combinations;
};

const findproductbytagsInCustomizedProduct = async (req, res, next) => {
  try {
    let products = await productSchema
      .find({
        tags: { $in: req.body.tags },
        CustomizedProduct: true,
      })
      .populate("attribute")
      .populate({
        path: "FrontAttribute",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackSAF",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackCB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      })
      .populate({
        path: "BackIB",
        populate: {
          path: "OptionsValue.AttributeCategory",
          select: {
            Name: 1,
          },
        },
      });

    res.status(200).json({
      success: true,
      data: products,
      message: "Product Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const newpostproduct = async (req, res, next) => {
  try {
    let imgdata = [];

    if (req.files) {
      req?.files?.map((m) => imgdata.push(m.filename));
    }

    let {
      ProductName,
      ProductDescription,
      FeaturedProduct,
      tags,
      SalePrice,
      OriginalPrice,
      ProductStatus,
      ProductInStockQuantity,
      SKU,
      Barcode,
      Urlhandle,
      SeoProductTitle,
      SeoMetaDesc,
      Installment,
      SellingType,
      attribute,
      GSTIN,
      CustomizedProduct,
      FixedPrice,
      BackSAF,
      BackCB,
      BackIB,
      FrontAttribute,
      FixedPriceSAF,
      FixedPriceCB,
      FixedPriceIB,
      RequestForPrice,
      Collection,
      CollectionChild,
      DefaultWidth,
      MinWidth,
      MaxWidth,
      DefaultHeight,
      MinHeight,
      MaxHeight,
      InstallmentAmount,
      Wastage,
    } = req.body;

    let productdata = {
      ProductName,
      ProductDescription,
      FeaturedProduct,
      tags,
      // SalePrice,
      // OriginalPrice,
      ProductStatus,
      ProductInStockQuantity,
      SKU,
      Barcode,
      Urlhandle,
      SeoProductTitle,
      SeoMetaDesc,
      ProductImage: imgdata,
      tags: JSON.parse(tags),
      Installment: JSON.parse(Installment),
      attribute: JSON.parse(attribute),
      SellingType,
      GSTIN,
      Collection,
      DefaultWidth,
      MinWidth,
      MaxWidth,
      DefaultHeight,
      MinHeight,
      MaxHeight,
      InstallmentAmount,
      Wastage,
    };

    if (CustomizedProduct) {
      productdata.CustomizedProduct = true;
    }

    if (FixedPrice) {
      productdata.FixedPrice = FixedPrice;
    }

    if (SalePrice) {
      productdata.SalePrice = SalePrice;
    }

    if (OriginalPrice) {
      productdata.OriginalPrice = OriginalPrice;
    }
    if (RequestForPrice) {
      productdata.RequestForPrice = RequestForPrice;
    } else {
      productdata.RequestForPrice = false;
    }

    if (BackIB) {
      productdata["BackIB"] = JSON.parse(BackIB);
    }
    if (FrontAttribute) {
      productdata["FrontAttribute"] = JSON.parse(FrontAttribute);
    }
    if (CollectionChild) {
      productdata["CollectionChild"] = JSON.parse(CollectionChild);
    }

    if (BackSAF) {
      productdata["BackSAF"] = JSON.parse(BackSAF);
    }

    if (BackCB) {
      productdata["BackCB"] = JSON.parse(BackCB);
    }

    if (FixedPriceSAF) {
      productdata["FixedPriceSAF"] = FixedPriceSAF;
    }

    if (FixedPriceCB) {
      productdata["FixedPriceCB"] = FixedPriceCB;
    }
    if (FixedPriceIB) {
      productdata["FixedPriceIB"] = FixedPriceIB;
    }

    let product = new productSchema(productdata);

    // Check for CoverBack and IgnoreBack

    if (product.BackSAF.length !== 0) {
      product = await product.populate("BackSAF");

      product.BackSAFPAQ = product.BackSAF.map((p) => {
        return {
          Name: p.Name,
          PositionX: 0,
          PositionY: 0,
          Quantity: 1,
          AttributeID: p._id,
          SelectedVariant: p?.OptionsValue[0]?._id,
          SelectedVariantName: p?.OptionsValue[0]?.Name,
        };
      });
    }

    if (product.BackCB.length !== 0) {
      product = await product.populate("BackCB");

      product.BackCBPAQ = product.BackCB.map((p) => {
        return {
          Name: p.Name,
          PositionX: 0,
          PositionY: 0,
          Quantity: 1,
          AttributeID: p._id,
          SelectedVariant: p?.OptionsValue[0]?._id,
          SelectedVariantName: p?.OptionsValue[0]?.Name,
        };
      });
    }

    if (product.BackIB.length !== 0) {
      product = await product.populate("BackIB");

      product.BackIBPAQ = product.BackIB.map((p) => {
        return {
          Name: p.Name,
          PositionX: 0,
          PositionY: 0,
          Quantity: 1,
          AttributeID: p._id,
          SelectedVariant: p?.OptionsValue[0]?._id,
          SelectedVariantName: p?.OptionsValue[0]?.Name,
        };
      });
    }

    const prod = await product.save();

    if (product.attribute.length !== 0) {
      let populateddata = await product.populate("attribute");

      //Setting the Position of Attribute Item

      populateddata.attributePosition = populateddata.attribute.map((p) => {
        return {
          Name: p.Name,
          PositionX: 0,
          PositionY: 0,
          Quantity: 1,
          AttributeID: p._id,
          SelectedVariant: p?.OptionsValue[0]?._id,
          SelectedVariantName: p?.OptionsValue[0]?.Name,
        };
      });

      await populateddata.save();
    }

    res.status(200).json({
      success: true,
      message: "All Product Data Fetched",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      // return next(handleError(500, "Same Product Url Already Present"));
    } else {
      next(handleError(500, error.message));
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const imagePath1 = path.join(__dirname, "../layer", "LAYER1.png");
const imagePath2 = path.join(__dirname, "../layer", "LAYER2.png");
const imagePath3 = path.join(__dirname, "../layer", "LAYER3.png");
const imagePath4 = path.join(__dirname, "../layer", "LAYER4.png");
const imagePath5 = path.join(__dirname, "../layer", "LAYER5.png");

const ImagegenrateRoute = async () => {
  try {
    let layers = [imagePath1, imagePath2, imagePath3, imagePath4, imagePath5];

    layers = layers.map((file) => ({ input: file }));

    let imagefilename = Date.now();

    const data = await sharp(layers[0].input)
      .composite(layers)
      .resize(1200, 950)
      .toFile(`./images/m/${imagefilename}.png`);

    if (data) {
      return imagefilename;
    }
  } catch (error) {}
};

const AttributeSetting = async (req, res, next) => {
  try {
    const { productId, fieldName, showField, CollectionId, ...rest } = req.body;
    const { isShow } = req.body;

    const updateddata = {};

    for (const key in rest) {
      updateddata[`${fieldName}.$.${key}`] = rest[key];
    }

    const showFieldObj = {
      [showField]: CollectionId, // attribute collection id
    };
    if (isShow) {
      await productSchema.findOneAndUpdate(
        { _id: req.params.id },
        { $addToSet: showFieldObj }
      );
    } else {
      await productSchema.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        { $pull: showFieldObj }
      );
    }

    const data = await productSchema
      .findOneAndUpdate(
        {
          _id: req.params.id,
          [`${fieldName}._id`]: req.params.itemId,
        },
        {
          $set: updateddata,
        },
        { new: true }
      )
      .populate("attribute")
      .populate("tags");

    res.status(200).json({
      success: true,
      message: "Position Updated SuccessFully",
      data: data,
    });
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error,
    });
  }
};
module.exports = {
  getproduct,
  postproduct,
  putProduct,
  deleteproduct,
  getproductdetails,
  removeImage,
  findproductbytags,
  addattribute,
  removeattribute,
  addattributeItem,
  removeattributeItem,
  updatevarient,
  uploadVarientImage,
  deleteVarientImage,
  getfilteredProduct,
  getpopulatevarientdata,
  changevarientposition,
  updateVarientList,
  upadteAttributePosition,
  getproductvarientSameasFront,
  upadteAttributeBackPosition,
  fullTextSearchFunctionality,
  getwhislist,
  updateDefaultValue,
  // On Product Addition Save Image to
  newpostproduct,
  updatevarientMulti,
  // genrateimagethroughApi,
  Urlhandle,
  findproductbytagsInCustomizedProduct,
  uploadVideo,
  removeVideo,
  updateData,
  AttributeSetting,
  removeDuplicateAttribute,
  getproductvarientFront,
};
