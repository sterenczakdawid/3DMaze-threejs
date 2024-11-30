import { io } from "socket.io-client";
import Game from "./Game";

const socket = io("http://localhost:3000");
socket.on("connect", () => {
	console.log("Connected to server with ID: ", socket.id);
});

const startScreen = document.getElementById("startScreen");
const playButton = document.getElementById("playButton");
const joinGameButton = document.getElementById("joinGameButton");

const timer = document.querySelector(".timer");
timer.classList.add("dn");

const joinGameForm = document.getElementById("joinGameForm");
const roomForm = document.getElementById("roomForm");
const roomIdInput = document.getElementById("roomId");
const cancelJoinBtn = document.getElementById("cancelJoin");

const joinSubmitBtn = document.getElementById("joinSubmit");
const createSubmitBtn = document.getElementById("createSubmit");

let game = null;

playButton.addEventListener("click", () => {
	startScreen.style.display = "none";
	joinGameForm.classList.remove("dn");
	joinSubmitBtn.style.display = "none";
	createSubmitBtn.style.display = "block";
	initializeGame("create");
});

joinGameButton.addEventListener("click", () => {
	startScreen.style.display = "none";
	joinGameForm.classList.remove("dn");
	createSubmitBtn.style.display = "none";
	joinSubmitBtn.style.display = "block";
	initializeGame("join");
});

const initializeGame = (mode) => {
	if (mode === "create") {
		// const game = new Game(document.querySelector("canvas.webgl"));
		// Tutaj ustawienia specyficzne dla "Utwórz grę" (np. połączenie serwera, inicjalizacja hosta)
		console.log("Utworzono grę, czekaj na innych graczy");
	} else if (mode === "join") {
		// Tutaj ustawienia specyficzne dla "Dołącz do gry" (np. połączenie do serwera jako klient)
		console.log("Dołączono do gry");
	}
};

roomForm.addEventListener("submit", (event) => {
	event.preventDefault();
	// console.log(createSubmitBtn.style.display);
	const roomId = event.target.roomId.value.trim();
	if (roomId) {
		if (createSubmitBtn.style.display == "none") {
			socket.emit("joinRoom", { roomId });
			socket.on("roomJoined", (data) => {
				console.log(
					`Dołączono do pokoju: ${data.roomId}, tworzę grę w oparciu o ${data.maze}`
				);
				// const
				game = new Game(
					document.querySelector("canvas.webgl"),
					"spectator",
					data.maze,
					socket,
					roomId
				);
				joinGameForm.classList.add("dn");
			});
			socket.on("mazeUpdated", (data) => {
				if (game && game.mode === "spectator") {
					console.log("Odebrano nowy labirynt: ", data.maze);
					game.updateMaze(data.maze);
				}
			});
		} else {
			// console.log("new game w create room");
			// const
			game = new Game(
				document.querySelector("canvas.webgl"),
				"creator",
				null,
				socket,
				roomId
			);
			setTimeout(() => {
				const grid = game.maze.grid;
				console.log("JSON stringify", JSON.stringify(grid, null, 2));
				socket.emit("createRoom", {
					roomId: roomId,
					maze: grid,
				});
			}, 2000);

			joinGameForm.classList.add("dn");

			socket.on("error", (data) => {
				alert(data.message);
			});
		}
	}
	console.log(roomId);
	roomIdInput.value = "";
});

cancelJoinBtn.addEventListener("click", () => {
	startScreen.style.display = "block";
	joinGameForm.classList.add("dn");
});
