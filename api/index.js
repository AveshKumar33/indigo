const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const { spawn } = require("child_process");
const compression = require("compression");
const cookieParser = require("cookie-parser");

app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

dotenv.config();
app.use(cors({ origin: true, credentials: true }));
const { exec } = require("child_process");

//Routes
const productRoute = require("./route/productRoute");
const singleProductRoute = require("./route/singleProductRoute");
const customizedProductRoute = require("./route/customizedProductRoute");
const customizedProductCombinationRoute = require("./route/customizedProductCombinationRoute");
const singleProductCombination = require("./route/singleProductCombinationRoute");
const imageRoute = require("./route/imageRoute");
const tagRoute = require("./route/tagsroute");
const UOMRoute = require("./route/uomRoute");

const AttributeCategorRoute = require("./route/AttributeCategorRoute");

const CollectionFilterRoute = require("./route/CollectionFilterRoute");
const collectionFilterNewRoute = require("./route/collectionFilterNewRoute");
const collectionTagRoute = require("./route/collectionTagRoute");
const collectionRoute = require("./route/collectionRoute");
const userRoute = require("./route/userRoute");
const userRoleRoute = require("./route/userRolerouter");
const uploadRoute = require("./route/imgFetchingRoute");
const couponRoute = require("./route/couponRoute");
const orderRoute = require("./route/orderRoute");
const attributeNewRoute = require("./route/attributeNewRoute");
const reviewRoute = require("./route/reviewRoute");
const newPaymentRoute = require("./route/newpaymentRoute");
const productbundle = require("./route/bundleRoute");
const atttributeRoute = require("./route/attributeModalRoute");
const dotRoute = require("./route/dotRoute");
const dotProductRoute = require("./route/dotProductRouteNew");
const customizeDotProductRoute = require("./route/customizeDotProductRoute");
const dotProductImageRoute = require("./route/dotProductImageRoute");
const customizeDotProductImageRoute = require("./route/customizeDotProductImageRoute");
const enquiryRoute = require("./route/enquiryRoute");
const catalogueRoute = require("./route/catalogueRoute");
const experienceRoute = require("./route/experienceRoute");
const exibhitionsRoute = require("./route/exibhitionsRouter");
const aboutUsRouter = require("./route/aboutUsRouter");
const projectCategoryRoute = require("./route/projectCategoryRoute");
const projectRoute = require("./route/projectRoute");
const sliderRoute = require("./route/sliderRoute");
const dotcustomizedRoute = require("./route/dotcustomizedRoute");
const architechRoute = require("./route/architechRoute");
const blogRoute = require("./route/blogRoute");
const raiseAQuery = require("./route/raiseAQueryRoute");
const ProductDescriptions = require("./route/ProductDescriptionsRoute");
const parameterRoute = require("./route/parameterRoute");
const positionRoute = require("./route/positionRoute");
const parameterPositionImageRoute = require("./route/parameterPositionImageRoute");
const customizeComboRoute = require("./route/customizeComboRoute");
const customizeComboRectangleRoute = require("./route/customizeComboRectangleRoute");
const headerImageRoute = require("./route/headerImageRoute");
const wishlistRoutes = require("./route/wishlistRoutes");

//connecting build folder to the server
__dirname = path.resolve();
app.use("/uploadFiles", express.static(path.join(__dirname, "/uploadFiles")));
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use("/video", express.static(path.join(__dirname, "/video")));
app.use("/layer", express.static(path.join(__dirname, "/layer")));
app.use(express.static(path.join(__dirname, "./dist")));

//Adding Route
app.use("/api/product", productRoute);
app.use("/api/product-new", singleProductRoute);
app.use("/api/customized-product", customizedProductRoute);
app.use(
  "/api/customized-product-combination",
  customizedProductCombinationRoute
);
app.use("/api/single-product-combination", singleProductCombination);
app.use("/api/ProductDescriptions", ProductDescriptions);
app.use("/api/image", imageRoute);
app.use("/api/tags", tagRoute);
app.use("/api/uom", UOMRoute);
app.use("/api/parameter", parameterRoute);
app.use("/api/position", positionRoute);
app.use("/api/combination", parameterPositionImageRoute);

app.use("/api/AttributeCategor", AttributeCategorRoute);
app.use("/api/CollectionFilter", CollectionFilterRoute);
app.use("/api/collection-filter", collectionFilterNewRoute);
app.use("/api/collection-tag", collectionTagRoute);
app.use("/api/collection", collectionRoute);
app.use("/api/user", userRoute);
app.use("/api/user-role", userRoleRoute);
app.use("/api/attribute-new", attributeNewRoute);
app.use("/api/uploads", uploadRoute);
app.use("/api/coupon", couponRoute);
app.use("/api/order", orderRoute);
app.use("/api/review", reviewRoute);
app.use("/api/payment", newPaymentRoute);
app.use("/api/raiseAQuery", raiseAQuery);

//Bundle Route
app.use("/api/productbundle", productbundle);
app.use("/api/attribute", atttributeRoute);

// dot model Route
app.use("/api/dotbundleproduct", dotRoute);
// dot product new  Route
app.use("/api/dot-product", dotProductRoute);
//customize dot product new  Route
app.use("/api/customize-dot-product", customizeDotProductRoute);

// dot productimage  Route
app.use("/api/dot-product-image", dotProductImageRoute);

// customize dot productimage  Route
app.use("/api/customize-dot-product-image", customizeDotProductImageRoute);

app.use("/api/customized-combo-product", customizeComboRoute);

app.use("/api/customized-combo-rectangle", customizeComboRectangleRoute);

//Enquiry Route
app.use("/api/enquiry", enquiryRoute);

//Catalogue Route
app.use("/api/catalogue", catalogueRoute);

//experience Route
app.use("/api/experience", experienceRoute);
//aboutUs Route
//experience Route
app.use("/api/exibhitions", exibhitionsRoute);
//aboutUs Route
app.use("/api/about-us", aboutUsRouter);

app.use("/api/projectCategory", projectCategoryRoute);

//project Route
app.use("/api/project", projectRoute);

//Slider Route
app.use("/api/slider", sliderRoute);

//dot Customized Route
app.use("/api/dotcustomizedRoute", dotcustomizedRoute);

//Architech Route
app.use("/api/architech", architechRoute);

//Blog Route
app.use("/api/blog", blogRoute);

//Blog Route
app.use("/api/header-image", headerImageRoute);

//Wishlist Route
app.use("/api/wishlist", wishlistRoutes);

// function backupMongoDB() {
//   const DB_NAME = "Railingo";
//   const ARCHIVE_PATH = path.join(__dirname, "public", `${DB_NAME}.gzip`);

//   const child = spawn("C:\\Program Files\\MongoDB\\mongodb-database-tools-windows-x86_64-100.8.0\\bin\\mongodump", [
//     `--db=${DB_NAME}`,
//     `--uri=mongodb://railingo:railingo123@3.108.31.154:27017/Railingo?ssl=false&authSource=admin`,
//     // `--username=railingo`,
//     // `--password=railingo123`,
//     // `--authenticationDatabase=admin`,
//     `--archive=${ARCHIVE_PATH}`,
//     "--gzip",
//   ]);

//   child.stdout.on("data", (data) => {
//     console.log("stdout:\n", data);
//   });
//   child.stderr.on("data", (data) => {
//     console.log("stderr:\n", Buffer.from(data).toString());
//   });
//   child.on("error", (error) => {
//     console.log("error:\n", error);
//   });
//   child.on("exit", (code, signal) => {
//     if (code) console.log("Process exit with code:", code);
//     else if (signal) console.log("Process killed with signal:", signal);
//     else console.log("Backup is successfull ✅");
//   });
// }

// app.get("/dbbackup", async (req, res) => {
//   try {

//     backupMongoDB();

//     // const databaseName = "test1"; // Replace with your MongoDB database name
//     // const backupDirectory = "/"; // Replace with the desired backup directory
//     // // const backupCommand = `mongodump --db ${databaseName} --out ${backupDirectory}`;
//     // const backupCommand = `mongodump --db ${databaseName} `;
//     // exec(backupCommand, (error, stdout, stderr) => {
//     //   if (error) {
//     //     console.error(`Error: ${error.message}`);
//     //     res.status(500).json({ error: "Internal Server Error" });
//     //     return;
//     //   }
//     //   console.log(`Backup Successful: ${stdout}`);
//     //   res.json({ message: "Backup Successful" });
//     // });
//   } catch (error) {
//     console.log(error)
//   }
// });

app.use((err, req, res, next) => {
  if (
    err.message === "Cannot read properties of undefined (reading 'isAdmin')"
  ) {
    err.message = "Token is Misssing";
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  let checkStatus = process.env.APP_STATUS === "TESTING";

  return res.status(status).json({
    ...(checkStatus && { errorstack: err.stack }),
    success: false,
    message: message,
  });
});

//Build Connection to the Server
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("connected to mongo"))
  .catch((err) => {
    console.log(err);
    return;
  });

const port = process.env.PORT || 7000;
// const port = process.env.PORT || 8002;

app.listen(port, () => {
  console.log(`Backend is listening at http://localhost:${port}`);
});
