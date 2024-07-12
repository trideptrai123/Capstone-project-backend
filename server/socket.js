import cors from "cors";
import { Server } from "socket.io"; // Import Socket.IO

let io;

export const  socketConfig =  {
  init: (server) => {
     io = new Server(server, {
        cors: {
          origin: "*", // URL của frontend
          methods: ["GET", "POST"],
          credentials: true,
        },
      }); // Tích hợp Socket.IO với server HTTP
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};