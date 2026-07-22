const jwt = require("../utils/jwt");
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try{
        const decoded = jwt.verifyToken(token);

        req.user = {
            id: decoded.id
        };
        next();
    }
    catch(err){
        return res.status(401).json({
            message: "Invalid Token"
        });
    }
}

module.exports = auth;