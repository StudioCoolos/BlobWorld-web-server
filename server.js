import WebSocket, { WebSocketServer } from "ws";

const socketServer = new WebSocketServer({
  port: process.env.PORT || 3001,
});

socketServer.on("error", console.error);
socketServer.on("listening", () => {
  console.log("listening on port %s", socketServer.options.port);
});

socketServer.on("connection", (socket) => {
  const socketName = `${socket._socket.remoteAddress}:${socket._socket.remotePort}`;
  console.log("connected: %s", socketName);
  socket.on("error", console.error);
  socket.on("close", (code, reason) => {
    console.log("disconnected: %s", socketName);
  });

  socket.on("message", (message, isBinary) => {
    //use socket name to log message
    console.log("received from %s: %s", socketName, message);
    socketServer.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        const clientName = `${client._socket.remoteAddress}:${client._socket.remotePort}`;
        console.log("sending to %s: %s", clientName, message);
        client.send(message, { binary: isBinary });
      }
    });
  });
});
