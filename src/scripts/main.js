import { io } from "socket.io-client";
import Game from "./Game";

const socket = io("http://localhost:3000");
socket.on("connect", () => {
	console.log("Connected to server with ID: ", socket.id);
});

const startScreen = document.getElementById("startScreen");
const playButton = document.getElementById("playButton");
const joinGameButton = document.getElementById("joinGameButton");

const createGameScreen = document.getElementById("createGameScreen");
const joinGameScreen = document.getElementById("joinGameScreen");

const createRoomForm = document.getElementById("createRoomForm");
const joinRoomForm = document.getElementById("joinRoomForm");

const timer = document.querySelector(".timer");
timer.classList.add("dn");

// const roomForm = document.getElementById("roomForm");
const roomIdInput = document.getElementById("roomId");
const cancelJoinBtn = document.getElementById("cancelJoin");

let game = null;

playButton.addEventListener("click", () => {
	startScreen.style.display = "none";
	createGameScreen.classList.remove("dn");
	// initializeGame("create");
});

joinGameButton.addEventListener("click", () => {
	startScreen.style.display = "none";
	joinGameScreen.classList.remove("dn");
	// initializeGame("join");
});

// const initializeGame = (mode) => {
// 	if (mode === "create") {
// 	} else if (mode === "join") {
// 	}
// };

createRoomForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const roomId = event.target.roomId.value.trim();
	const difficulty = document.getElementById("difficulty").value;
	const algorithm = document.getElementById("algorithm").value;
	const gameOptions = {
		mode: "creator",
		socket,
		roomId,
		difficulty,
		algorithm,
	};
	game = new Game(document.querySelector("canvas.webgl"), gameOptions);

	setTimeout(() => {
		const grid = game.maze.grid;
		// console.log("JSON stringify", JSON.stringify(grid, null, 2));
		socket.emit("createRoom", {
			roomId: roomId,
			maze: grid,
		});
	}, 2000);

	// roomIdInput.value = "";
	createGameScreen.classList.add("dn");
});

joinRoomForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const roomId = event.target.roomId.value.trim();
	if (roomId) {
		socket.emit("joinRoom", { roomId });
		socket.on("roomJoined", (data) => {
			const gameOptions = {
				mode: "spectator",
				mazeData: data.maze,
				socket,
				roomId,
			};
			game = new Game(document.querySelector("canvas.webgl"), gameOptions);
			joinGameScreen.classList.add("dn");
		});
		socket.on("mazeUpdated", (data) => {
			if (game && game.mode === "spectator") {
				console.log("Odebrano nowy labirynt: ", data.maze);
				game.updateMaze(data.maze);
			}
		});
	}
	// roomIdInput.value = "";
});
// roomForm.addEventListener("submit", (event) => {
// 	event.preventDefault();
// 	const roomId = event.target.roomId.value.trim();
// 	const difficulty = document.getElementById("difficulty").value;
// 	const algorithm = document.getElementById("algorithm").value;
// 	console.log(difficulty, algorithm);
// 	if (roomId) {
// 		if (createSubmitBtn.style.display == "none") {
// 			socket.emit("joinRoom", { roomId });
// 			socket.on("roomJoined", (data) => {
// 				// console.log(
// 				// 	`Dołączono do pokoju: ${data.roomId}, tworzę grę w oparciu o ${data.maze}`
// 				// );
// 				// const
// 				const gameOptions = {
// 					mode: "spectator",
// 					mazeData: data.maze,
// 					socket,
// 					roomId,
// 				};
// 				game = new Game(
// 					document.querySelector("canvas.webgl"),
// 					gameOptions
// 					// "spectator",
// 					// data.maze,
// 					// socket,
// 					// roomId
// 				);
// 				joinGameForm.classList.add("dn");
// 			});
// 			socket.on("mazeUpdated", (data) => {
// 				if (game && game.mode === "spectator") {
// 					console.log("Odebrano nowy labirynt: ", data.maze);
// 					game.updateMaze(data.maze);
// 				}
// 			});
// 		} else {
// 			// console.log("new game w create room");
// 			// const
// 			const gameOptions = {
// 				mode: "creator",
// 				socket,
// 				roomId,
// 				difficulty,
// 				algorithm,
// 			};
// 			game = new Game(
// 				document.querySelector("canvas.webgl"),
// 				gameOptions
// 				// "creator",
// 				// null,
// 				// socket,
// 				// roomId
// 			);
// 			setTimeout(() => {
// 				const grid = game.maze.grid;
// 				console.log("JSON stringify", JSON.stringify(grid, null, 2));
// 				socket.emit("createRoom", {
// 					roomId: roomId,
// 					maze: grid,
// 				});
// 			}, 2000);

// 			joinGameForm.classList.add("dn");

// 			socket.on("error", (data) => {
// 				alert(data.message);
// 			});
// 		}
// 	}
// 	console.log(roomId);
// 	roomIdInput.value = "";
// });

cancelJoinBtn.addEventListener("click", () => {
	startScreen.style.display = "block";
	joinGameForm.classList.add("dn");
});
