const express = require("express");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const server = createServer(app);
const io = new Server(server);

let users = {};

io.on("connection", (socket) => {
  console.log(`connected by user : ${socket.id}`);
  users[socket.id] = {
    id: socket.id,
    username: `User-${socket.id.slice(0, 4)}`,
  };

  socket.emit("all_users", Object.values(users));

  socket.on("send_location", (data) => {
    users[socket.id] = { id: socket.id, ...data }; // includes username, lat, long
    io.emit("receive_location", users[socket.id]);
  });

  socket.on("disconnect", () => {
    users[socket.id].offline = true;
    io.emit("user_disconnected", socket.id);
    console.log(`disconnected by user : ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(3000);
