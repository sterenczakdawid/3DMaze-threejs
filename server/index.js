import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
	},
});

const rooms = {};
let maze = {};

io.on("connection", (socket) => {
	console.log("A user connected: ", socket.id);

	socket.on("joinRoom", (data) => {
		console.log("łączenie z pokojem na serwerze, id: ", data.roomId);
		// console.log("Serwer posiada juz taki maze piekny: ", maze);
		socket.emit("mazeData", maze);
	});

	socket.on("createRoom", (data) => {
		// console.log("Tworzenie pokoju na serwerze, id: ", data.roomId);
		// console.log("Otrzymalem gre XD: ", data.maze[0][0].walls);
		// const dmaze = JSON.parse(data.maze);
		// console.log("Serwer otrzymał 0 0: ", data.maze[0][0]);
		// console.log("Serwer otrzymal 0 1", data.maze[0][1]);
		maze = data.maze;
	});

	socket.on("disconnect", () => {
		console.log(`User ${socket.id} disconnected`);
	});
});

// app.get("/", (req, res) => {
// 	res.send("<h1>Hello world</h1>");
// });

server.listen(3000, () => {
	console.log("server running at port 3000");
});

// const io = new Server({
// 	cors: {
// 		origin: "http://localhost:5173",
// 	},
// });

// io.listen(3000);

// let mainPlayerId = null;

// io.on("connection", (socket) => {
// 	socket.userData = { x: 0, y: 0, z: 0 };
// 	if (!mainPlayerId) {
// 		mainPlayerId = socket.id; // Pierwszy gracz jest głównym graczem
// 		socket.emit("assignRole", { role: "Host" });
// 	} else {
// 		socket.emit("assignRole", { role: "Spectator" });
// 	}
// 	// console.log(`User ${socket.id} connected`);
// 	console.log(
// 		`User ${socket.id} connected as ${
// 			mainPlayerId === socket.id ? "Host" : "Spectator"
// 		}`
// 	);
// 	// if (socket.id === mainPlayerId) {
// 	// 	console.log("Główny gracz");
// 	// } else {
// 	// 	console.log("Poboczny graczXD");
// 	// }

// 	// socket.emit("setId", { id: socket.id, isMain: socket.id === mainPlayerId });
// 	// socket.emit("setId", { id: socket.id });
// 	socket.on("disconnect", () => {
// 		console.log(`Gracz ${socket.id} rozłączył się`);
// 		if (socket.id === mainPlayerId) {
// 			console.log("Host disconnected, no player controlling.");
// 			mainPlayerId = null; // Reset main player
// 		}
// 		io.emit("deletePlayer", { id: socket.id });
// 	});

// 	socket.on("init", (data) => {
// 		// console.log(`socket.init ${data}`);
// 		socket.userData.x = data.x;
// 		socket.userData.y = data.y;
// 		socket.userData.z = data.z;
// 	});

// 	// socket.on("update", (data) => {
// 	// 	socket.userData.x = data.x;
// 	// 	socket.userData.y = data.y;
// 	// 	socket.userData.z = data.z;
// 	// });
// 	socket.on("update", (data) => {
// 		if (socket.id === mainPlayerId) {
// 			socket.userData.x = data.x;
// 			socket.userData.y = data.y;
// 			socket.userData.z = data.z;
// 		}
// 	});
// });

// // setInterval(() => {
// // 	const pack = [];

// // 	io.sockets.sockets.forEach((socket) => {
// // 		if (socket.userData) {
// // 			pack.push({
// // 				id: socket.id,
// // 				x: socket.userData.x,
// // 				y: socket.userData.y,
// // 				z: socket.userData.z,
// // 			});
// // 		}
// // 	});
// // 	if (pack.length > 0) io.emit("remoteData", pack);
// // }, 40);

// // setInterval(() => {
// // 	if (mainPlayerId) {
// // 		const mainPlayerSocket = io.sockets.sockets.get(mainPlayerId);
// // 		if (mainPlayerSocket && mainPlayerSocket.userData) {
// // 			io.emit("mainPlayerData", {
// // 				id: mainPlayerId,
// // 				x: mainPlayerSocket.userData.x,
// // 				y: mainPlayerSocket.userData.y,
// // 				z: mainPlayerSocket.userData.z,
// // 			});
// // 		}
// // 	}
// // }, 40);
// setInterval(() => {
// 	const pack = [];

// 	io.sockets.sockets.forEach((socket) => {
// 		if (socket.userData) {
// 			pack.push({
// 				id: socket.id,
// 				x: socket.userData.x,
// 				y: socket.userData.y,
// 				z: socket.userData.z,
// 				role: socket.id === mainPlayerId ? "Host" : "Spectator",
// 			});
// 		}
// 	});
// 	if (pack.length > 0) io.emit("remoteData", pack);
// }, 40);
