import jwt from "jsonwebtoken";
import { asyncWrapper } from "../utils/apiError.js";
import User from "../models/User.js";

export const protect = asyncWrapper(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized to access this route" });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Not authorized - invalid or expired token" });
  }
  req.user = await User.findById(decoded.id).select("-password");
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized - user not found" });
  }
  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role ${req.user.role} is not allowed` });
    }
    next();
  };
};
