const mongoose = require("mongoose");

const customizedProductSchema = new mongoose.Schema({
  ProductName: {
    type: String,
    required: [true, "Product Name is Required"],
  },
  ProductDescription: {
    type: String,
    // required: [true, "Product Description is Required"],
  },
  ProductImage: {
    type: [String],
  },

  FeaturedProduct: {
    type: Boolean,
    default: false,
  },

  SellingType: {
    type: String,
    enum: ["Normal", "Installment"],
    default: "Normal",
  },

  Collection: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "collection",
    required: true,
  },

  FixedPrice: {
    type: Number,
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

  ProductStatus: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  Installment: [
    {
      Name: {
        type: String,
      },
      Amount: {
        type: Number,
      },
    },
  ],
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
  ],
  attribute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
    },
  ],

  GSTIN: {
    type: Number,
    default: 0,
  },
  displaySequence: {
    type: Number,
  },

  installnationCharge: {
    type: Number,
    default: 0,
  },

  isCustomizedProduct: {
    type: Boolean,
    default: true,
  },

  // CollectionChild: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "collection",
  //   },
  // ],

  SeoProductTitle: {
    type: String,
  },
  video: {
    type: String,
    default: "",
  },
  SeoMetaDesc: {
    type: String,
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

  Wastage: {
    type: Number,
    default: 0,
  },

  status: {
    type: Number,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: new Date().toISOString(),
  },

  updatedAt: {
    type: Date,
    default: new Date().toISOString(),
  },

  RequestForPrice: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },
});

module.exports = mongoose.model(
  "CustomizedProductModel",
  customizedProductSchema
);

// ------------------------------------------------------------
/*

    ProductVideo: {
      type: [String],
    },

    SalePrice: {
      type: Number,
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


    ProductInStockQuantity: {
      type: Number,
      // required: [true, "Product InStock Qunatity Required"],
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

    CustomizedProduct: {
      type: Boolean,
      default: false,
    },

    isConfiguration: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomizedProductSchema", CustomizedProductSchema);



 DefaultWidth: 2
MinWidth: -1
MaxWidth: 22
DefaultHeight: 2
MinHeight: -1
MaxHeight: 2
Wastage: 3
InstallmentAmount: 3
ProductName: CUSTOMIZE
isCustomizeProduct: true
ProductDescription: <p>DSSD</p>
FeaturedProduct: true
tags: ["65c61afa0705db35c9d142f0"]
Installment: []
ProductStatus: Active
SKU: 333
Barcode: 333
SellingType: Normal
GSTIN: 5
Urlhandle: CUSTOMIZE
SeoProductTitle: server test
SeoMetaDesc: 33
attribute: []
Collection: 65a6d9ec715ff716de5d6877
CollectionChild: ["659a86b7925acde5d59aa896","659a8727925acde5d59aa8b6","659a877f925acde5d59aa8ce","65a6d9ec715ff716de5d6877"]
FixedPrice: 2
BackIB: []
BackCB: []
BackSAF: []
FrontAttribute: []
FixedPriceSAF: 2
FixedPriceCB: 1
FixedPriceIB: 2
productimg: (binary)

 */
