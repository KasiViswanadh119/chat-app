const express = require("express");
const app = express();
const cors = require("cors");
const http = require('http').Server(app);
const PORT = 4000;
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "https://strangerschatroom.netlify.app"
    }
});

app.use(cors());
const activeUsers = new Set(); // Use a Set to store active users

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    
    // Listen for incoming messages
    socket.on("message", (data) => {
        socketIO.emit("messageResponse", data);
    });

    // Listen for 'typing' events and broadcast to other clients
    socket.on("typing", (data) => {
        socket.broadcast.emit("typingResponse", data);
    });

    // Add user to the active users set
    activeUsers.add(socket.id);
    
    // Emit updated active users to all clients
    socketIO.emit("newUserResponse", Array.from(activeUsers));

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
        activeUsers.delete(socket.id); // Remove user from active users set
        socketIO.emit("newUserResponse", Array.from(activeUsers)); // Emit updated active users
    });
});

app.get("/api", (req, res) => {
    res.json({ message: "Hello" });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
