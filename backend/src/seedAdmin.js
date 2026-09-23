import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@gmail.com";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin KhanaGo";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    let user = await User.findOne({ email: ADMIN_EMAIL });

    if (user) {
      user.role = "admin";
      user.isActive = true;
      await user.save();
      console.log(`Promoted existing user to admin: ${ADMIN_EMAIL}`);
    } else {
      user = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "admin",
        isActive: true,
      });
      console.log(`Admin created: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
    }

    await mongoose.disconnect();
    console.log("Done");
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();