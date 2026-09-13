import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../../socket/socket";

const Network = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const handleConnect = () => {
      console.log("🟢 Socket connected:", socket.id);
    };

    const handleConnectError = (error) => {
      console.error("🔴 Socket connection error:", error.message);
    };

    const handleDisconnect = (reason) => {
      console.log("🟡 Socket disconnected:", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    // Important: if socket was already connected before this component mounted
    if (socket.connected) {
      console.log("🟢 Socket already connected:", socket.id);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    const handleConnectionRequest = (data) => {
      console.log("🔔 Connection request received:", data);

      setSuggestions((prev) =>
        prev.map((person) =>
          person.user_id === data.sender_id
            ? {
              ...person,
              connection_status: "pending",
            }
            : person
        )
      );
    };

    socket.on("connection_request", handleConnectionRequest);

    return () => {
      socket.off("connection_request", handleConnectionRequest);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem("token");

        console.log("Token:", token);

        const response = await axios.get(
          "http://192.168.0.111:5000/api/network/suggestions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Suggestions response:", response.data);

        setSuggestions(response.data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        console.log("Status:", err.response?.status);
        console.log("Response:", err.response?.data);
      }
    };

    fetchSuggestions();
  }, []);

  const sendConnection = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");

      console.log("Sending connection to:", receiverId);

      const response = await axios.post(
        `http://192.168.0.111:5000/api/network/connect/${receiverId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Connection response:", response.data);

      // Update this particular person's status
      setSuggestions((prev) =>
        prev.map((person) =>
          person.user_id === receiverId
            ? {
              ...person,
              connection_status: "pending",
            }
            : person
        )
      );

    } catch (err) {
      console.error("Error sending connection:", err);

      console.log("Status:", err.response?.status);
      console.log("Response:", err.response?.data);
    }
  };



  return (
    <div className="people-network">

      {suggestions.map((suggestion) => (
        <div className="person" key={suggestion.user_id}>

          <div className="person-detail">

            <img
              style={{ cursor: "default" }}
              className="profile-pic"
              src={
                suggestion.profile_image
                  ? `http://192.168.0.111:5000/uploads/profiles/${suggestion.profile_image}`
                  : "profile_picture.png"
              }
              alt="Profile"
            />
            <div>
              <h3
                style={{
                  paddingLeft: 20,
                  cursor: "default",
                }}
              >
                {suggestion.first_name} {suggestion.last_name}
              </h3>
              <p style={{ paddingLeft: 20, cursor: "default" }}>
                @{suggestion.username}
              </p>

            </div>
          </div>

          <div className="buttons">
            <button className="view-profile">
              View Profile
            </button>

            <button
              className="connect-button"
              onClick={() => sendConnection(suggestion.user_id)}
              disabled={
                suggestion.connection_status === "pending" ||
                suggestion.connection_status === "accepted"
              }
            >
              {suggestion.connection_status === "pending"
                ? "Pending"
                : suggestion.connection_status === "accepted"
                  ? "Connected"
                  : "Connect"}
            </button>
          </div>

        </div>
      ))}

    </div>
  );
};

export default Network;