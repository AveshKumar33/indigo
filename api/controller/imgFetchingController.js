const path = require("path");
const fs = require("fs");
const { handleError } = require("../utils/handleError");

const getallImages = (req, res, next) => {
  try {
    const imagesFolderPath = path.join(
      __dirname,
      `../images/${req.query.name}`
    );

    fs.readdir(imagesFolderPath, (err, files) => {
      if (err) {
       
        return res.status(500).json({ error: "Failed to read images" });
      }

      const images = files.map((file) => ({
        name: file,
        url: `/images/${req.query.name}/${file}`,
      }));

      res.json(images);
    });

    // let img = fs.readdir(imagesFolderPath);

    // console.log("img",img)

    // res.status(200).json({
    //   sucess: true,
    //   data: img,
    // });
  } catch (error) {
   
    res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};

const postImages = (req, res) => {
  try {
  } catch (error) {}
};

const deleteImages = (req, res) => {
  try {

   
    const imgPath = `images/${req.params.foldername}/${req.params.filename}`;
    
    if (fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath);
    }

    res.status(200).json({
      sucess:true,
      message:"Image Deleted Successfully"
    })

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
};

module.exports = { getallImages, postImages, deleteImages };
