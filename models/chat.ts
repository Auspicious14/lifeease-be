import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    message: { type: String },
    userId: { type: String },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model("chat", ChatSchema);
