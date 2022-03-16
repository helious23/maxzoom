import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const PORT = 3000;
const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// connection event 시, 실행 할 코드 작성
wsServer.on("connection", (socket) => {
  // enter_room event 실행 시 콜백 함수 실행
  // 콜백 함수 인자 중 마지막 인자는 frontend 에서 넘겨준 콜백 함수
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName); // roomName 방에 들어감
    done(); // frontend 의 enter_room 콜백 함수 실행
    socket.to(roomName).emit("welcome"); // roomName 방에 welcome event 실행
  });

  // disconnecting : disconnect 보다 조금 더 빨리 실행
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", msg);
    done();
  });
});

/* 
const wss = new WebSocket.Server({ server });
const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);

  socket["nickname"] = `익명${new Date().getTime().toString().slice(-4)}`;

  console.log("Connected to Browser ✅");

  socket.on("close", () => console.log("Disconnected from Browser ❌"));

  socket.on("message", (msg) => {
    const message = JSON.parse(msg.toString());

    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${message.payload}`)
        );
        break;
      case "nickname":
        console.log(message.payload);
        socket["nickname"] = message.payload;
        break;
    }
  });
});
*/

httpServer.listen(PORT, handleListen);
