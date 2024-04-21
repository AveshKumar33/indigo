const parameterPositionImageSchema = require("../modal/parameterPositionImageModal");
const { handleError } = require("../utils/handleError");
const fs = require("fs");
const { ObjectId } = require("mongodb");

/** get all Parameter Position Image   */
const getAllParameterPositionImage = async (req, res, next) => {
  try {
    const parameterPositionImage = await parameterPositionImageSchema
      .find()
      .populate("attributeId", { Name: 1 });

    res.status(200).json({
      success: true,
      data: parameterPositionImage,
      message: "Data fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** get parameter Position Image by attributeId */
const getParameterPositionImageByAttributeId = async (req, res, next) => {
  try {
    const combination = await parameterPositionImageSchema.aggregate([
      {
        $match: {
          attributeId: new ObjectId(req.params.attributeId),
          positionId: new ObjectId(req.params.positionId),
          parameterId: new ObjectId(req.params.parameterId),
        },
      },
    ]);

    const result = await parameterPositionImageSchema.populate(combination, [
      {
        path: "attributeId",
        select: "-createdAt -updatedAt -updatedBy -createdBy ",
      },
      {
        path: "positionId",
        select: "-createdAt -updatedAt -updatedBy -createdBy ",
      },
      {
        path: "parameterId",
        select: "-createdAt -updatedAt -updatedBy -createdBy ",
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
const getParameterPositionImageById = async (req, res, next) => {
  try {
    const { attributeId, id } = req.params;
    const { limit, page } = req.query;
    // const yourSearchTerm = search || "";
    const pageNo = parseInt(page) || 1;
    const limits = parseInt(limit) || 100;

    let query = {};

    if (attributeId) {
      query.attributeId = attributeId;
    }
    if (id) {
      query["$or"] = [{ parameterId: id }, { positionId: id }];
    }

    const parameterPositionImage = await parameterPositionImageSchema
      .find(query)
      .sort({ updatedAt: -1 })
      .skip((pageNo - 1) * limits)
      .limit(limits)
      .populate([
        { path: "attributeId", select: { Name: 1 } },
        { path: "positionId", select: { name: 1 } },
        {
          path: "parameterId",
          populate: {
            path: "attributeCategoryId",
            select: { Name: 1 },
          },
          select: { name: 1, attributeCategoryId: 1 },
        },
      ])
      .lean();
    parameterPositionImage.sort((a, b) =>
      a.parameterId.attributeCategoryId.Name.localeCompare(
        b.parameterId.attributeCategoryId.Name
      )
    );
    const totalCount = await parameterPositionImageSchema.find(query).count();

    res.status(200).json({
      success: true,
      data: parameterPositionImage,
      totalCount: totalCount,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** create parameter Position Image */
const createParameterPositionImage = async (req, res, next) => {
  try {
    const { positionId, parameterId, attributeId } = req.body;
    const pngImage = req.file.filename;

    const positionParameterData = new parameterPositionImageSchema({
      positionId,
      parameterId,
      attributeId,
      pngImage,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });
    const savedParameterPositionImage = await positionParameterData.save();

    res.status(200).json({
      success: true,
      message: "parameter Position Image Created Successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      next(handleError(500, "Position already Present"));
    } else {
      next(handleError(500, error.message));
    }
  }
};

/** update parameter Position Image */
const updateParameterPositionImageById = async (req, res, next) => {
  try {
    const positionParameterData = {
      updatedBy: req.user.id,
    };

    if (req.file) {
      positionParameterData.pngImage = req.file.filename;
    }

    const updatedParameterPositionImage =
      await parameterPositionImageSchema.findByIdAndUpdate(req.params.id, {
        $set: positionParameterData,
      });

    if (
      req.file &&
      updatedParameterPositionImage.pngImage !==
        "parameterPositiondefaultImage.png"
    ) {
      try {
        const imgpath = `images/parameterPosition/${updatedParameterPositionImage.pngImage}`;
        if (fs.existsSync(imgpath)) {
          fs.unlinkSync(imgpath);
        }
      } catch (err) {
        console.log("error is coming ", err);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedParameterPositionImage,
      message: "parameter Position Image Updated Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

/** delete parameter Position Image by Id */
const deleteParameterPositionImageById = async (req, res, next) => {
  try {
    const parameterPositionImage =
      await parameterPositionImageSchema.findByIdAndDelete(req.params.id);

    if (parameterPositionImage) {
      const imgpath = `images/parameterPosition/${parameterPositionImage.pngImage}`;
      if (fs.existsSync(imgpath)) {
        fs.unlinkSync(imgpath);
      }
    }
    res.status(200).json({
      success: true,
      message: "parameter Position Image Deleted Successfully",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

module.exports = {
  deleteParameterPositionImageById,
  getParameterPositionImageById,
  updateParameterPositionImageById,
  createParameterPositionImage,
  getAllParameterPositionImage,
  getParameterPositionImageByAttributeId,
};
