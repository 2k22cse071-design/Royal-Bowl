const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // In prod, use strong secret

exports.verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "No token provided!" });
    }

    // Expect "Bearer <token>"
    const bearerToken = token.split(" ")[1];
    if (!bearerToken) {
        return res.status(403).json({ message: "Invalid token format!" });
    }

    jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

exports.isAdmin = (req, res, next) => {
    if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Require Admin Role!" });
    }
    next();
};
