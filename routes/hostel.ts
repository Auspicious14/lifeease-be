import express from "express";
import {
  createHostel,
  deleteHostel,
  getAllHostel,
  getOneHostel,
  updateHostel,
} from "../controllers/hostel/hostel";
import { verifyTokenAndAdmin } from "../middlewares/verifyToken";

const route = express.Router();

route.get("/hostels", getAllHostel);
route.get("/hostel/:id", getOneHostel);
route.post("/hostel", verifyTokenAndAdmin, createHostel);
route.put("/hostel/:id", verifyTokenAndAdmin, updateHostel);
route.delete("/hostel/:id", deleteHostel);

export default route;
