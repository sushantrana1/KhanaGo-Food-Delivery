import { config } from "../config/env.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiError, asyncWrapper } from "../utils/apiError.js";

const getCookieMaxAge = (expiresIn) => {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn);
  switch (unit) {
    case "d": return value * 24 * 60 * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "m": return value * 60 * 1000;
    case "s": return value * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
};

export const register = asyncWrapper(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError("User already exists with this email", 400));
  }
  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user._id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    maxAge: getCookieMaxAge(config.jwtExpiresIn),
  });
  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

export const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError("Invalid email or password", 401));
  }
  if (!user.isActive) {
    return next(new ApiError("Your account has been disabled", 403));
  }
  const token = generateToken(user._id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    maxAge: getCookieMaxAge(config.jwtExpiresIn),
  });
  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

export const logout = asyncWrapper(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ status: "success", message: "Logged out successfully" });
});

export const getMe = asyncWrapper(async (req, res) => {
  res.status(200).json({ status: "success", user: req.user });
});
