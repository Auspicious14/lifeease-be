const dotenv = require("dotenv");
dotenv.config();
import { appRoute } from "./index";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ChatModel } from "./models/chat";

const app = express();
const sever = createServer(app);
const mongoose = require("mongoose");
const port: any = process.env.PORT || 5000;
const URI = process.env.MONGODB_URL;
const io = new Server(sever, { cors: { origin: "*" } });

io.on("connection", (socket: Socket) => {
  console.log("connected", socket.connected);

  socket.on(
    "sendMessage",
    async (message: { sender: string; message: string }) => {
      try {
        const newMessage = new ChatModel(message);
        await newMessage.save();
        console.log("message", newMessage);
        io.emit("receiveMessage", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("A user disconnected.");
  });
});

mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    sever.listen(port, () => console.log(`server is listening on port ${port}`))
  )
  .catch((err: any) => console.log(err));

app.use(appRoute);
