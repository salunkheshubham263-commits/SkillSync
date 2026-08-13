const jwt = require("../utils/jwt");

const auth = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {

    const decoded = jwt.verifyToken(token);

    req.user = {
      id: decoded.id,
    };

    next();

  } catch (err) {

    console.error("Auth middleware error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = auth;