const dotenv = require("dotenv");
import { Request, Response } from "express";
import * as argon2 from "argon2";
import userAuthModel from "../../models/userAuth";
import { handleErrors } from "../../middlewares/errorHandler";
import { sendEmail } from "../../middlewares/email";
import { generateOTP } from "../../middlewares/generateOTP";
import expressAsyncHandler from "express-async-handler";
import passport from "passport";
const GoogleStartegy = require("passport-google-oidc");
dotenv.config();

export const createUserAuth = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const account = await userAuthModel.findOne({ email });
    if (account) return res.status(409).json({ message: "User already exist" });
    const hashedPassword = await argon2.hash(password);
    const user = new userAuthModel({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.json({
      user: {
        _id: user?._id,
        name: user?.name,
        displayName: user?.displayName,
        email: user?.email,
        isAgent: user?.isAgent,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
};

export const loginUserAuth = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user: any = await userAuthModel.findOne({ email });
    // .select("-password");
    console.log(user);
    if (!user) return res.status(404).json({ error: "Account Not found" });
    const comparePassword: boolean = await argon2.verify(
      user.password,
      password
    );
    if (!comparePassword)
      return res.status(400).json({ error: "Wrong password" });
    res.json({
      user,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ success: false, error });
  }
};

export const updateuser = async (req: Request, res: Response) => {
  const id = req.params.id;
  let { name, displayName, email, isAdmin } = req.body;
  console.log(req.body);
  try {
    const user: any = await userAuthModel.findByIdAndUpdate(
      id,
      {
        $set: { name, displayName, email, isAdmin },
      },
      { new: true }
    );
    console.log(user);
    if (!user)
      return res.status(404).json({ success: false, error: "No user found" });
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors, message: "Error" });
  }
};

export const deleteUserAuth = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const user: any = await userAuthModel.findByIdAndDelete(id);
    if (!user) throw "User not found";
    res.json({ success: true, message: "user has been deleted" });
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors });
  }
};

export const getUserAuth = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user: any = await userAuthModel.findById(id).select("-password");
    if (!user) throw "No user found";
    res.json({ success: true, user });
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors });
  }
};

export const getUsersAuth = async (req: Request, res: Response) => {
  const query = req.query.new;
  try {
    const users: any = query
      ? await userAuthModel
          .find()
          .select("-password")
          .sort({ _id: -1 })
          .limit(10)
      : await userAuthModel.find().select("-password");
    if (!users) throw "No user found";
    res.json({ success: true, users });
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user: any = await userAuthModel.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "Account with the email does not exist",
      });
    const { otp, otpDate } = generateOTP();
    user.manageOTP.otp = otp;
    user.manageOTP.otpDate = otpDate;
    await user.save();
    const message = `<div>Dear ${user?.lastName}</div> <br /> <div>Your verification code is ${otp}</div><br /> <div>Verification code will expire within 1hr</div>`;
    sendEmail(user.email, "Requesting Password Reset", JSON.stringify(message));

    res.json({
      success: true,
      message: `Check your mail for your verification code`,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp: userOtp } = req.body;
  try {
    const user: any = await userAuthModel.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    const { otp, otpDate } = user.manageOTP;
    const expiryDate = otpDate + 60 * 60 * 1000;

    if (otp !== userOtp)
      return res.json({
        success: false,
        message: "Incorrect OTP",
      });

    if (expiryDate < Date.now())
      return res.json({
        success: false,
        message: "OTP expired",
      });
    res.json({
      verified: true,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  try {
    const user: any = await userAuthModel.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });

    const oldPassword = user.password;
    const comparePassword = await argon2.verify(oldPassword, newPassword);

    if (comparePassword)
      return res.json({
        success: false,
        message: "You entered your old password",
      });
    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;
    await user.save();
    res.json({
      success: true,
      message: "Password successfully changed.",
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword, id } = req.body;
  try {
    const user: any = await userAuthModel.findById(id);
    if (user) {
      const old = await argon2.verify(user.password, oldPassword);
      if (!old) return res.json({ error: "old password does not match" });
      const newPass = await argon2.hash(newPassword);
      user.password = newPass;
      await user.save();
      res.json({ message: "Password Updated" });
    } else {
      res.json({ message: "Unauthorised user" });
    }
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors });
  }
};

export const signInWithGoogle = expressAsyncHandler(
  async (req: Request, res: Response) => {
    passport.use(
      new GoogleStartegy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/oauth2/redirect/google",
          scope: ["profile"],
        },
        async (issuer: any, profile: any, cb: any) => {
          const user = await userAuthModel.findOne({ email: profile?.email });
          console.log(user, "google userr");
          if (!user) {
            const data = await userAuthModel.create({
              name: profile?.displayName,
              email: profile?.email,
            });
            res.status(201).json({ success: true, data });
          } else {
            res
              .status(400)
              .json({ success: false, message: "Account already exist" });
          }
        }
      )
    );
  }
);
