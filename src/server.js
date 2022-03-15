import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const PORT = 3000;
const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);

const server = http.createServer(app);
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

server.listen(PORT, handleListen);
