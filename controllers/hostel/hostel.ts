import { Request, Response } from "express";
import { mapFiles } from "../../middlewares/file";
import { HostelModel } from "../../models/hostel";

export const createHostel = async (req: Request, res: Response) => {
  const { images, name, description, available, roomNumber } = req.body;

  try {
    const files = await mapFiles(images);
    const data = await HostelModel.create({
      images: files || {},
      name,
      description,
      available,
      roomNumber,
    });
    console.log(data);
    res.json({ Message: "Success", data });
  } catch (error) {
    res.json({ Message: "Error", Error: error });
  }
};

export const updateHostel = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { images, ...values } = req.body;
  let files = images;
  try {
    if (images) files = await mapFiles(images);
    const data: any = await HostelModel.findByIdAndUpdate(
      id,
      { $set: { files, values } },
      { new: true }
    );
    res.json({ Message: "Success", data });
  } catch (error) {
    res.json({ Message: "Error", Error: error });
  }
};

export const deleteHostel = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const del: boolean | null = await HostelModel.findByIdAndDelete(id);
    if (del) {
      // const data: any = await HostelModel.find();
      res.json({ Message: "Success", data: true });
    }
  } catch (error) {
    res.json({ Message: "Error", Error: error });
  }
};

export const getAllHostel = async (req: Request, res: Response) => {
  try {
    const data: any = await HostelModel.find();
    res.json({ Message: "Success", data });
  } catch (error) {
    res.json({ Message: "Error", Error: error });
  }
};

export const getOneHostel = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data: any = await HostelModel.findById(id);
    if (id != data._id) throw new Error("No product found!");
    res.json({ Message: "Success", data });
  } catch (error) {
    res.json({ Message: "Error", Error: error });
  }
};
