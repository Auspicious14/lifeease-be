import mongoose from "mongoose";

const Schema = mongoose.Schema;

const HostelSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    available: { type: Boolean, default: true },
    location: { type: String },
    roomNumber: { type: String, required: true },
    images: {
      type: [{ uri: String, name: String, type: String }],
      required: false,
    },
  },
  { timestamps: true }
);

export const HostelModel = mongoose.model("hostel", HostelSchema);
