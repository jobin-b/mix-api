import { server } from "../app";
import { Server, Socket } from "socket.io";

export const io = new Server(server);

io.on("connection", (socket: Socket) => {
  console.log("a user connected");

  socket.on("joinGroups", (groupId: string) => {
    socket.join(groupId);
    console.log(`user joined group ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
