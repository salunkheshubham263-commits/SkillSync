const http = require("http");
const app = require("./app");
const initializeSocket = require("./socket/socket");

const server = http.createServer(app);

const io = initializeSocket(server);

app.set("io", io);

server.listen(5000, "0.0.0.0", () => {
  console.log("server is running on port 5000");
});