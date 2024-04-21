const mongoose = require("mongoose");

const newproductSchema = new mongoose.Schema(
  {
    ProductName: {
      type: String,
      required: [true, "Product Name is Required"],
    },

    DefaultWidth: {
      type: Number,
      default: 0,
    },
    MinWidth: {
      type: Number,
      default: 0,
    },
    MaxWidth: {
      type: Number,
      default: 0,
    },
    DefaultHeight: {
      type: Number,
      default: 0,
    },
    MinHeight: {
      type: Number,
      default: 0,
    },
    MaxHeight: {
      type: Number,
      default: 0,
    },
    InstallmentAmount: {
      type: Number,
      default: 0,
    },
    Wastage: {
      type: Number,
      default: 0,
    },
    ProductDescription: {
      type: String,
      // required: [true, "Product Description is Required"],
    },
    ProductImage: {
      type: [String],
    },
    ProductVideo: {
      type: [String],
    },
    FeaturedProduct: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        required: true,
      },
    ],
    SalePrice: {
      type: Number,
    },
    Collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collection",
      required: true,
    },
    CollectionChild: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "collection",
      },
    ],
    OriginalPrice: {
      type: Number,
      // required: [true, "Price Is Required"],
    },
    SellingType: {
      type: String,
      enum: ["Normal", "Installment"],
      default: "Normal",
    },
    RequestForPrice: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    ShowSAF: {
      type: Boolean,
      enum: [true, false],
      default: true,
    },
    ShowIB: {
      type: Boolean,
      enum: [true, false],
      default: true,
    },
    ShowCB: {
      type: Boolean,
      enum: [true, false],
      default: true,
    },
    Installment: [
      {
        Name: {
          type: String,
        },
        Amount: {
          type: Number,
          default: 0,
        },
      },
    ],
    ProductStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    ProductInStockQuantity: {
      type: Number,
      // required: [true, "Product InStock Qunatity Required"],
    },
    SKU: {
      type: String,
      // unique: true,
    },
    Barcode: {
      type: String,
    },
    Urlhandle: {
      type: String,
      required: [true, "Product Url Handle Required"],
      unique: true,
    },
    SeoProductTitle: {
      type: String,
    },
    SeoMetaDesc: {
      type: String,
    },
    Pro_Con_Details: {
      type: Object,
      default: {},
    },
    varient: [
      // {
      //   images:[],
      //   OriginalPrice:{
      //     type:Number
      //   },
      //   ProductInStockQuantity:{
      //     type:Number
      //   }
      // }
    ],

    // Create All Possible Back Same As
    // varientBackSAF: [],

    //Create All Poss

    // varientBackCB: [],

    // varientBackIB: [],

    // attribute:[
    //   {
    //     attributeName:{
    //       type:String
    //     },
    //     attributeItems:[]
    //   }
    // ]
    attribute: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attributeModal",
      },
    ],
    //Back Attribute Item Same As Front
    FrontAttribute: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attributeModal",
      },
    ],
    BackSAF: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attributeModal",
      },
    ],

    //Back Attribute Item Same As Cover Back
    BackCB: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attributeModal",
      },
    ],

    //Back Attribute Item Same As Ignore Back
    BackIB: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attributeModal",
      },
    ],

    attributePosition: [
      {
        Name: {
          type: String,
        },
        AttributeID: {
          type: String,
        },
        PositionX: {
          type: Number,
          default: 0,
        },
        PositionY: {
          type: Number,
          default: 0,
        },
        Quantity: {
          type: Number,
          default: 0,
        },
        isShow: {
          type: Boolean,
          default: true,
        },
        SelectedVariant: {
          type: String,
        },
        SelectedVariantName: {
          type: String,
        },
        PositionGroup: {
          type: String,
        },
        PositionGroupName: {
          type: String,
        },
      },
    ],

    //Back Same as Front Position and Quantity

    BackSAFPAQ: [
      {
        Name: {
          type: String,
        },
        PositionX: {
          type: Number,
          default: 0,
        },
        PositionY: {
          type: Number,
          default: 0,
        },
        Quantity: {
          type: Number,
          default: 0,
        },
        AttributeID: {
          type: String,
        },
        isShow: {
          type: Boolean,
          default: true,
        },
        SelectedVariant: {
          type: String,
        },
        SelectedVariantName: {
          type: String,
        },
        PositionGroup: {
          type: String,
        },
        PositionGroupName: {
          type: String,
        },
      },
    ],

    //Cover Back Position and Quantity
    BackCBPAQ: [
      {
        Name: {
          type: String,
        },
        PositionX: {
          type: Number,
          default: 0,
        },
        PositionY: {
          type: Number,
          default: 0,
        },
        Quantity: {
          type: Number,
          default: 0,
        },
        AttributeID: {
          type: String,
        },
        SelectedVariant: {
          type: String,
        },
        SelectedVariantName: {
          type: String,
        },
        PositionGroup: {
          type: String,
        },
        PositionGroupName: {
          type: String,
        },
        isShow: {
          type: Boolean,
          default: true,
        },
      },
    ],

    //Ignore Back Position and Quantity
    BackIBPAQ: [
      {
        Name: {
          type: String,
        },
        PositionX: {
          type: Number,
          default: 0,
        },
        PositionY: {
          type: Number,
          default: 0,
        },
        Quantity: {
          type: Number,
          default: 0,
        },
        AttributeID: {
          type: String,
        },
        isShow: {
          type: Boolean,
          default: true,
        },
        SelectedVariant: {
          type: String,
        },
        SelectedVariantName: {
          type: String,
        },
        PositionGroup: {
          type: String,
        },
        PositionGroupName: {
          type: String,
        },
      },
    ],

    GSTIN: {
      type: Number,
      default: 0,
    },
    CustomizedProduct: {
      type: Boolean,
      default: false,
    },
    FixedPrice: {
      type: Number,
    },
    isConfiguration: {
      type: Boolean,
      default: false,
    },

    FixedPriceSAF: {
      type: Number,
      default: 0,
    },
    FixedPriceCB: {
      type: Number,
      default: 0,
    },
    FixedPriceIB: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", newproductSchema);
