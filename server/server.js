import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routers/userRoutes.js";
import universityRoutes from "./routers/universityRoutes.js";
import categoryRoutes from "./routers/categoryRoutes.js";
import blogPostRoutes from "./routers/blogPostRoutes.js";
import commentBlogPostRoutes from "./routers/commentBlogRoutes.js";
import roomRoutes from "./routers/roomRoutes.js";
import majorRoutes from "./routers/majorRoutes.js";
import messageRoutes from "./routers/messageRoutes.js";
import teacherRoutes from "./routers/teacherRoutes.js";
import requestRoutes from "./routers/requestRoutes.js";



import { createServer } from "http"; // Import module HTTP
import { Server } from "socket.io"; // Import Socket.IO

import {
  notFound,
  errorHandler,
} from "../server/middleware/errorMiddleware.js";
import Message from "./models/Message.js";
import { socketConfig } from "./socket.js";

const app = express();
const server = createServer(app);
const io  = socketConfig.init(server)
// = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000", // URL của frontend
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// }); // Tích hợp Socket.IO với server HTTP
app.use(express.json());
app.use(cookieParser());
dotenv.config();

mongoose
  .connect(
    "mongodb+srv://phamphuoctri:20052002tri@cluster0.ajsvu9b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const corsOptions = {
   // URL của frontend// origin: "http://localhost:3000",
   origin: ['http://localhost:3000', 'http://localhost:3001','http://localhost:3002',"https://capstone-project-umno.onrender.com","https://capstone-project-admin-fe.onrender.com"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Routes
app.use("/api/users", userRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/posts/comment", commentBlogPostRoutes);
app.use("/api/posts", blogPostRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/major", majorRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/request", requestRoutes);




// Socket.IO setup
io.on("connection", (socket) => {
  console.log("connnect")
  socket.on("joinRoom", (roomId) => {
    console.log("join room" + roomId)
    socket.join(roomId);
  });

  socket.on("sendMessage", (newMessage) => {
    io.to(newMessage.roomId).emit("message", newMessage);
    io.emit("lastMessage", newMessage);
  });
  socket.on("renameRoom", (data) => {
    io.to(data.roomId).emit("newNameRoom", data);
  });
  socket.on("changeImage", (data) => {
    io.to(data.roomId).emit("newImage", data);
  });


  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use(notFound);
app.use(errorHandler);
app.set("io",io)

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
