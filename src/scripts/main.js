import { io } from "socket.io-client";
import Game from "./Game";

const socket = io("http://localhost:3000");
socket.on("connect", () => {
	console.log("new connection");
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
			socket.emit("joinRoom", { roomId: roomId });
			socket.on("mazeData", (data) => {
				// console.log("maze data otrzymane", data);
				const game = new Game(
					document.querySelector("canvas.webgl"),
					"spectator",
					data
				);
			});
			// console.log("new game w join room");
			// console.log("stworzyłem grę: ", game);
		} else {
			// console.log("new game w create room");
			const game = new Game(document.querySelector("canvas.webgl"), "creator");
			setTimeout(() => {
				const grid = game.maze.grid;
				console.log("JSON stringify", JSON.stringify(grid, null, 2));
				socket.emit("createRoom", {
					roomId: roomId,
					maze: grid,
				});
			}, 4000);
			// console.log(game.maze.grid);
			// console.log(serializeGrid(game.maze.grid));
			// const grid = serializeGrid(game.maze.grid);
			// const grid = game.maze.grid;
			// console.log("sss", JSON.stringify(game.maze.grid, null, 2));
			// console.log(grid);
			// bar = JSON.stringify(
			// 	canvas.getObjects().map(function (o) {
			// 		o.toJSON = undefined;
			// 		return o;
			// 	})
			// );
			// const gridCopy = JSON.parse(JSON.stringify(grid));
			// const grid;

			// console.log("wysylam na serwer grida: ", grid);

			joinGameForm.classList.add("dn");
		}
	}
	console.log(roomId);
	roomIdInput.value = "";
});

cancelJoinBtn.addEventListener("click", () => {
	startScreen.style.display = "block";
	joinGameForm.classList.add("dn");
});

const serializeGrid = (grid) => {
	console.log(grid);
	let newGrid = new Array();
	for (let r = 0; r < grid.length; r++) {
		for (let c = 0; c < grid[0].length; c++) {
			// newGrid[r][c] = {
			// 	walls: grid[r][c].getWalls(),
			// };
			newGrid.push(grid[r][c].getWalls());
			console.log(`grid[${r}][${c}]`, grid[r][c].getWalls());
			// console.log(`grid[${r}][${c}]`, maze.getCell(r, c).walls.frontWall);
		}
	}
	console.log("new grid", newGrid);
	return newGrid;
	// Serializacja gridu, każda komórka wywoła toJSON
	// return grid.map((row) =>
	// 	row.map((cell) => {
	// 		// console.log("cell tj", cell.toJSON());
	// 		return cell.toJSON();
	// 	})
	// );
};
