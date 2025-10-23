import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication failed. No token provided or incorrect format.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication failed. Invalid token.",
    });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.userData || req.userData.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. You are not an admin or not authenticated.",
    });
  }
  next();
};

export { authenticate, isAdmin };