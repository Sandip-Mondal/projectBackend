require('dotenv').config();
require('./db');
const express = require('express');
const path = require('path');
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
const router = require("./Routes");
const PORT = process.env.PORT || 8201

app.use(express.static(path.join(__dirname, "./client/build")));

app.use(router);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"))
})

const server = app.listen(PORT, () => {
    console.log(PORT);
});

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

const users = {};

const socketToRoom = {};

io.on('connection', (socket) => {
    socket.on('permit', (Id, id, name) => {
        io.to(Id).emit("pending", id, name);
    });

    socket.on('ans', (id, ans) => {
        io.to(id).emit('reply', ans);
    });


    socket.on("join", (ID) => {
        socket.join(ID);
    })


    socket.on("join room", roomID => {
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        socket.emit("all users", usersInThisRoom);
    });


    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
            users[roomID].map((id) => {
                io.to(id).emit('dis-connect', socket.id);
            })
        }
    });

    socket.on('leaveCall', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
            users[roomID].map((id) => {
                io.to(id).emit('dis-connect', socket.id);
            })
        }
    });
});


