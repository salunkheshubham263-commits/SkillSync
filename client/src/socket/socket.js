import { io } from "socket.io-client";

const socket = io("http://192.168.0.111:5000", {
  auth: (cb) => {
    const token = localStorage.getItem("token");

    cb({
      token,
    });
  },
  transports: ["websocket"],
});

socket.on("connection_request", (data) => {
  console.log("Connection request received:", data);

  window.dispatchEvent(
    new CustomEvent("connection-request-notification", {
      detail: data,
    })
  );
});

export default socket;