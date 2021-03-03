const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// TODO: verify if game exists
var activeGames = {};

function pollGames() {
    // for each active game
    for (const gameId in activeGames) {
        // If room is empty remove active game
        if (io.sockets.adapter.rooms.get(gameId) == undefined) {
            delete activeGames[gameId];
        }
    }
}

app.use(express.static("static"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/game/:gameId", (req, res) => {
    res.sendFile(__dirname + "/game/index.html");
});

io.on("connection", (socket) => {
    console.log(socket.id + " connected");

    socket.on("createGame", (gameSettings) => {
        console.log(gameSettings);

        // Generate a random gameId
        let gameId = Math.random().toString(36).substr(2, 8);
        activeGames[gameId] = gameSettings;

        console.log(gameId);
        socket.emit("redirect", "/game/" + gameId);
    });

    socket.on("joinGame", (gameId) => {
        // add socket to room
        // if 2 connections to room start game
        // if > 2 make player spectate

        // Check if game exists
        // TODO: emit fail or success

        socket.join(gameId);
        io.sockets.adapter.rooms.get(gameId);
        let room = io.sockets.adapter.rooms.get(gameId);

        // Check if room exists
        if (gameId in activeGames) {
            console.log(room)

            console.log(socket.id + " joined room " + gameId);
            console.log("There are " + room.size + " players in the room");
        }
        else {
            console.log("Game " + gameId + " doesn't exist");
        }

    });

    socket.on("disconnect", () => {
        console.log(socket.id + " disconnected");

        // Wait 10 seconds before ending game
        setTimeout(pollGames, 10000);
    });
});

http.listen(3000, () => {
    console.log("listening on *:3000");
});