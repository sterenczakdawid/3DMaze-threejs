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

	socket.on("createRoom", (data) => {
		const roomId = data.roomId;
		if (rooms[roomId]) {
			socket.emit("error", { message: "Room with given name already exists" });
			return;
		}

		rooms[roomId] = {
			hostId: socket.id,
			maze: data.maze,
			players: [socket.id],
		};

		socket.join(roomId);
		socket.emit("roomCreated", { roomId });
		socket.emit("assignRole", { role: "Host" });
		console.log(`User ${socket.id} created and joined room ${roomId} as Host`);
	});

	socket.on("joinRoom", (data) => {
		const roomId = data.roomId;
		if (!rooms[roomId]) {
			socket.emit("error", { message: "Room with given name does not exist" });
			return;
		}

		rooms[roomId].players.push(socket.id);
		socket.join(roomId);
		socket.emit("roomJoined", { roomId, maze: rooms[roomId].maze });
		socket.emit("assignRole", { role: "Spectator" });
		console.log(`User ${socket.id} joined room ${roomId} as Spectator`);
	});

	// socket.on("createRoom", (data) => {
	// 	maze = data.maze;
	// });

	socket.on("updatePosition", (data) => {
		const roomId = Object.keys(rooms).find(
			(roomId) => rooms[roomId].hostId === socket.id
		);
		if (roomId) {
			socket.to(roomId).emit("hostPositionUpdate", data);
		}
	});

	socket.on("updateMaze", (data) => {
		const { roomId, maze } = data;

		if (rooms[roomId]) {
			rooms[roomId].maze = maze;
			socket.to(roomId).emit("mazeUpdated", { maze });
			console.log(`Labirynt w pokoju ${roomId} został zaktualizowany`);
		} else {
			console.log(`Pokój ${roomId} nie istnieje`);
		}
	});

	socket.on("disconnect", () => {
		console.log(`User ${socket.id} disconnected`);

		for (const roomId in rooms) {
			const room = rooms[roomId];
			if (room.players.includes(socket.id)) {
				room.players = room.players.filter((id) => id !== socket.id);

				if (room.hostId === socket.id) {
					console.log(`Host opuścił pokój ${roomId}, usuwanie pokoju.`);
					socket.to(roomId).emit("hostDisconnected");
					delete rooms[roomId];
				} else {
					console.log(`Gracz ${socket.id} opuścił pokój ${roomId}`);
				}
				break;
			}
		}
	});
});

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
