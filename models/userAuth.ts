const { isEmail } = require("validator");
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userAuthSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    displayName: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: isEmail,
    },
    password: { type: String, required: true, minLength: 6, select: false },
    isAgent: { type: Boolean, default: false },
    manageOTP: {
      otp: { type: Number },
      otpDate: { type: Number },
    },
  },
  { timestamps: true }
);

const userAuthModel = mongoose.model("user", userAuthSchema);
export default userAuthModel;
