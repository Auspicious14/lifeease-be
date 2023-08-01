const dotenv = require("dotenv");
dotenv.config();
import { appRoute } from "./index";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ChatModel } from "./models/chat";
const textEncrypt = require("text-encryption");

const app = express();
const sever = createServer(app);
const mongoose = require("mongoose");
const port: any = process.env.PORT || 5000;
const URI = process.env.MONGODB_URL;
const io = new Server(sever, { cors: { origin: "*" } });

mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    sever.listen(port, () => console.log(`server is listening on port ${port}`))
  )
  .catch((err: any) => console.log(err));

const userSocketMap = new Map();
io.on("connection", async (socket: Socket) => {
  console.log("connected", socket.connected);

  socket.on("authenticate", (userId) => {
    userSocketMap.set(userId, socket);
  });

  socket.on(
    "sendMessage",
    async (message: { userId: string; message: string }) => {
      try {
        const userId = message.userId;
        const userSocket = userSocketMap.get(userId);
        console.log("user socket:", userSocket);
        if (message.message !== "" && message.message !== undefined) {
          const encryptMessage = await textEncrypt.encrypt(
            message.message,
            process.env.TEXT_KEY as string
          );
          const newMessage = new ChatModel({ message: encryptMessage, userId });
          await newMessage.save();
          if (userSocket) {
            io.emit("receiveMessage", newMessage);
          }
        }
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  );

  const messages = await ChatModel.find();
  io.emit("receiveAllMessage", messages);

  console.log(messages);
  socket.on("disconnect", () => {
    console.log("A user disconnected.");
  });
});

app.use(appRoute);
