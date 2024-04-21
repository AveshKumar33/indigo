const jwt = require("jsonwebtoken");
const { handleError } = require("./handleError");

const verifyToken = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    new Error("Login Required");
    //  return next(handleError(503,"Login Required"))
  }

  const authHeader = req.headers.token;

  if (authHeader) {
    jwt.verify(authHeader, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Token Is Invalid",
        });
      }

      req.user = user;

      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "you are not Authenticated",
    });
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user) {
      next();
    } else {
      return res.status(403).json("you are not allowded to do that");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user) {
      next();
    } else {
      //    next(handleError(403, "you are not allowded to do that"));
      return res
        .status(403)
        .json({ success: false, message: "you are not allowded to do that" });
    }
  });
};

const verifyTokenBackend = async (req, res, next) => {
  try {
    const architecttoken = req.cookies.token;

    if (!architecttoken) {
      return next(handleError(500, "You are not Authenticated"));
    }

    const { id } = jwt.verify(architecttoken, process.env.JWT_SECRET_KEY);

    req.user = id;
    next();
  } catch (error) {
    next(handleError(500, "Token is Inavlid"));
  }
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenBackend,
};
