const multer = require("multer");
const { handleError } = require("./handleError");

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      console.log("7file", file.fieldname);

      switch (file.fieldname) {
        case "uploadProductVideo":
          cb(null, "video/ProductVideo");
          break;

        case "userimg":
          cb(null, "images/user");
          break;
        case "catalogueimg":
          cb(null, "images/catalogue");
          break;
        case "cataloguepdf":
          cb(null, "images/catalogue");
          break;
        case "image":
          cb(null, "images/product");
          break;

        case "uploadCollectionVideo":
          cb(null, "video/CollectionVideo");
          break;

        case "reviewimg":
          cb(null, "images/review");
          break;

        case "profileImage":
          cb(null, "images/parameter");
          break;

        case "pngImage":
          cb(null, "images/parameterPosition");
          break;

        case "productimg":
          cb(null, "images/product");
          break;

        case "attributeimg":
          cb(null, "images/attribute");
          break;

        case "headerImage":
          cb(null, "images/header");
          break;

        case "CollectionImage":
          cb(null, "images/collection");
          break;
        case "experienceimg":
          cb(null, "images/experience");
          break;
        case "exibhitionsimg":
          cb(null, "images/exibhitions");
          break;
        case "aboutusimg":
          cb(null, "images/aboutUs");
          break;
        case "architect":
          cb(null, "images/architect");
          break;

        case "bundleimg":
          cb(null, "images/productbundle");
          break;

        case "ordersImage":
          cb(null, "images/orders");
          break;

        case "dotimg":
          cb(null, "images/dotimage");
          break;

        case "projectimg":
          cb(null, "images/project");
          break;

        case "sliderimg":
          cb(null, "images/slider");
          break;

        case "projectvideo":
          cb(null, "video/project");
          break;

        case "dotcustomizedimg":
          cb(null, "images/dotcustomizedproduct");
          break;

        case "blogimg":
          cb(null, "images/blog");
          break;

        default:
          cb(null, "images/extra");
          break;
      }
    },
    filename(req, file, cb) {
      let extArray = file.mimetype.split("/");
      let extension = extArray[extArray?.length - 1];
      cb(null, `${file.fieldname}-${new Date().getTime()}.${extension}`);
    },
  }),
  limits: {
    fileSize: 500000000, // max file size 2MB = 1000000 bytes
  },
  fileFilter(req, file, cb) {
    if (
      file.originalname.match(
        /\.(jpeg|jpg|png|JPG|PNG|JPEG|webp|mp4|gif|GIF|pdf|PDF)$/
      )
    ) {
      cb(null, true);
    } else {
      return cb(new Error("Please upload only jpeg,jpg,png file."));
    }
  },
});

module.exports = upload;
