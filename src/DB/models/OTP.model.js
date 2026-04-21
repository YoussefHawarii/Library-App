import { Schema, model } from "mongoose";
const otpSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      trim: true,
      required: [true, "please provide your email"],
    },
    otp: {
      type: String,
      required: [true, "please provide the OTP code"],
    },
  },
  { timestamps: true },
);
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 }); //expire the OTP after 5 minutes

const OTP = model("OTP", otpSchema);

export default OTP;
