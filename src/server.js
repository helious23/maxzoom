import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
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
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

const getPublicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

// connection event 시, 실행 할 코드 작성
wsServer.on("connection", (socket) => {
  // 닉네임 정하지 않을 경우
  socket["nickname"] = `익명${new Date().getTime().toString().slice(-4)}`;

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  // enter_room event 실행 시 콜백 함수 실행
  // 콜백 함수 인자 중 마지막 인자는 frontend 에서 넘겨준 콜백 함수
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName); // roomName 방에 들어감
    done(countRoom(roomName)); // frontend 의 enter_room 콜백 함수 실행
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // roomName 방에 welcome event 실행
    wsServer.sockets.emit("room_change", getPublicRooms());
  });

  // disconnecting : disconnect 보다 조금 더 빨리 실행
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", getPublicRooms());
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    done();
  });

  socket.on("nickname", (nickname, done) => {
    if (nickname !== "") {
      socket["nickname"] = nickname;
    }
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
