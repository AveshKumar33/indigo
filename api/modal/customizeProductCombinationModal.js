const mongoose = require("mongoose");

const customizedProductCombinationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomizedProductModel",
  },
  ShowSAF: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },
  ShowIB: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },
  ShowCB: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  Front: [
    {
      attributeId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      positionX: {
        type: Number,
        default: 0,
      },
      positionY: {
        type: Number,
        default: 0,
      },
      isShow: {
        type: Boolean,
        default: false,
      },
      parameterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter",
      },
      positionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Position",
      },
    },
  ],

  SAF: [
    {
      attributeId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      positionX: {
        type: Number,
        default: 0,
      },
      positionY: {
        type: Number,
        default: 0,
      },
      isShow: {
        type: Boolean,
        default: false,
      },
      parameterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter",
      },
      positionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Position",
      },
    },
  ],

  CB: [
    {
      attributeId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      positionX: {
        type: Number,
        default: 0,
      },
      positionY: {
        type: Number,
        default: 0,
      },
      isShow: {
        type: Boolean,
        default: false,
      },
      parameterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter",
      },
      positionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Position",
      },
    },
  ],

  IB: [
    {
      attributeId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      positionX: {
        type: Number,
        default: 0,
      },
      positionY: {
        type: Number,
        default: 0,
      },
      isShow: {
        type: Boolean,
        default: false,
      },
      parameterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter",
      },
      positionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Position",
      },
    },
  ],
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
});

module.exports = mongoose.model(
  "CustomizeProductCombinationModel",
  customizedProductCombinationSchema
);
