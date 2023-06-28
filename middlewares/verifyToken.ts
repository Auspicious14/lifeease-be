import { NextFunction, Request, response, Response } from "express";
import dotenv from "dotenv";
import userAuthModel from "../models/userAuth";
import { handleErrors } from "./errorHandler";
dotenv.config();

export const verifyTokenAndAuth = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const id = userId;
  try {
    const user = await userAuthModel.findById({ _id: id });
    if (!user) return new Error("no user found");
    if (user?._id == id) {
      next();
    } else {
      res.json({ error: "unauthorised user" });
    }
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors });
  }
};
export const verifyTokenAndAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.body;
  try {
    const user = await userAuthModel.findById({ _id: id });
    if (!user) return res.json("no user found");
    if (user?.isAgent) {
      next();
    } else {
      res.json({ error: "unauthorised user" });
    }
  } catch (error) {
    const errors = handleErrors(error);
    res.json({ errors });
  }
};
