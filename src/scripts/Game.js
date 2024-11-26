import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Maze } from "./maze";
import { Player } from "./Player";
import { Physics } from "./physics";
import { createGUI } from "./gui";
import { io } from "socket.io-client";
import Timer from "./Timer";
import PlayerLocal from "./PlayerLocal";

const stats = new Stats();
document.body.append(stats.dom);
let instance = null;

export default class Game {
	constructor(canvas, mode, mazeData = null) {
		if (instance) {
			return instance;
		}
		instance = this;
		// TODO can delete later
		window.game = this;
		this.canvas = canvas;
		this.mode = mode;
		this.mazeData = mazeData;
		// console.log("Game z mazeData: ", this.mazeData);
		// console.log("Gra w trybie: ", this.mode);
		this.scene = new THREE.Scene();
		this.sizes = { width: window.innerWidth, height: window.innerHeight };
		this.timer = new Timer();

		this.remotePlayers = [];
		this.remoteColliders = [];
		this.initialisingPlayers = [];
		this.remoteData = [];

		this.init();
	}

	init() {
		/**
		 * Camera
		 */
		// Base camera
		this.orbitCamera = new THREE.PerspectiveCamera(
			75,
			this.sizes.width / this.sizes.height,
			0.1,
			1000
		);
		this.orbitCamera.position.set(-32, 16, -32);
		this.scene.add(this.orbitCamera);

		// Maze
		if (this.mode === "creator") {
			console.log("creator");
			this.maze = new Maze();
			console.log(this.maze);
			this.maze.generate();
			this.scene.add(this.maze);
			console.log(this.maze.grid);
		} else {
			// console.log("spectator, mazeData: ", this.mazeData);
			if (this.mazeData) this.maze = new Maze(5, this.mazeData);
			this.maze.generate();
			this.scene.add(this.maze);
			console.log(this.maze.grid);
		}
		// this.maze.generateKruskal();
		// maze.generateWilson();
		// maze.generateEller();
		// this.scene.add(this.maze);

		/**
		 * Player & physics
		 */
		// this.player = new Player(this.scene);
		this.player = new PlayerLocal();
		// const localPlayer = new Player(scene, true);
		this.physics = new Physics(this.scene);
		this.player.maxSpeed = 7;
		this.player.cameraHelper.visible = false;
		this.player.boundsHelper.visible = false;
		this.physics.helpers.visible = false;

		/**
		 * Lights
		 */
		this.ambientLight = new THREE.AmbientLight(0x404040, 4); // Increase intensity for brighter ambient light
		this.scene.add(this.ambientLight);

		this.directionalLight = new THREE.DirectionalLight(0x0000ff, 2.0);
		this.directionalLight.position.set(50, 100, 50);
		this.directionalLight.castShadow = true;
		this.directionalLight.shadow.mapSize.width = 1024;
		this.directionalLight.shadow.mapSize.height = 1024;
		this.directionalLight.shadow.camera.near = 0.5;
		this.directionalLight.shadow.camera.far = 500;
		this.directionalLight.shadow.camera.left = -100;
		this.directionalLight.shadow.camera.right = 100;
		this.directionalLight.shadow.camera.top = 100;
		this.directionalLight.shadow.camera.bottom = -100;
		this.scene.add(this.directionalLight);

		// Green light at the entrance
		this.entranceLight = new THREE.PointLight(0xff0000, 50, 20);
		this.entranceLight.position.set(2, 2, -1);
		this.scene.add(this.entranceLight);

		// Green light at the exit
		this.exitLight = new THREE.PointLight(0x00ff00, 50, 20);
		this.exitLight.position.set(
			this.maze.rows * 4 - 2,
			2,
			this.maze.columns * 4
		);
		this.scene.add(this.exitLight);

		// Controls
		this.controls = new OrbitControls(this.orbitCamera, this.canvas);
		this.controls.target.set(16, 0, 16);
		this.controls.enableDamping = true;

		/**
		 * Renderer
		 */
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
		});

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		window.addEventListener("resize", () => {
			// Update sizes
			this.sizes.width = window.innerWidth;
			this.sizes.height = window.innerHeight;

			// // Update camera
			this.orbitCamera.aspect = this.sizes.width / this.sizes.height;
			this.orbitCamera.updateProjectionMatrix();

			this.player.camera.aspect = this.sizes.width / this.sizes.height;
			this.player.camera.updateProjectionMatrix();

			// Update renderer
			this.renderer.setSize(this.sizes.width, this.sizes.height);
			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		});

		this.previousTime = 0;
		this.restartButton = document.querySelector(".restartButton");
		this.restartButton.addEventListener("click", () => {
			this.resetGame();
		});
		createGUI(this.maze, this.player, this.physics);
		this.animate();
	}

	animate() {
		// console.log("animate");
		requestAnimationFrame(() => {
			this.animate();
		});
		const currentTime = performance.now();
		const deltaTime = (currentTime - this.previousTime) / 1000;
		this.controls.update();
		this.player.applyInputs(deltaTime);
		this.player.updateBoundsHelper();
		this.player.update(deltaTime); // Aktualizacja animacji gracza
		if (this.player.position.z > -1 && !this.timer.isTimerRunning) {
			this.timer.startTimer();
		}
		this.physics.update(deltaTime, this.player, this.maze);
		this.checkIfPlayerReachedEnd();
		this.renderer.render(
			this.scene,
			this.player.controls.isLocked ? this.player.camera : this.orbitCamera
		);
		stats.update();
		this.previousTime = currentTime;
		this.updateRemotePlayers(deltaTime);
	}

	resetGame() {
		this.player.controls.lock();
		this.player.position.set(2, 2, -10);
		this.player.camera.lookAt(2, 2, 1);
		this.player.velocity.set(0, 0, 0);
		this.scene.remove(this.maze);
		this.maze = new Maze();
		this.maze.generate();
		this.scene.add(this.maze);
		this.restartButton.classList.remove("btn-visible");
		this.restartButton.classList.add("dn");
		this.timer.timerElement.innerText = "Time: 0:00";
	}

	checkIfPlayerReachedEnd() {
		const maze = this.maze;
		// const player = this.player;
		const endCell = maze.grid[maze.rows - 1][maze.columns - 1];
		if (
			this.player.position.x >= endCell.rowNum * 4 &&
			this.player.position.z >= (endCell.colNum + 1) * 4
		) {
			this.timer.stopTimer();
			this.player.controls.unlock();
			this.restartButton.classList.add("btn-visible");
			this.restartButton.classList.remove("dn");
		}
	}

	updateRemotePlayers(deltaTime) {
		this.remotePlayers.forEach((player) => {
			if (player.role === "Spectator") {
				this.scene.remove(player.model); // Usuń model Spectatora ze sceny
			} else {
				player.update(deltaTime); // Aktualizuj tylko Host
			}
		});
	}
	// updateRemotePlayers(deltaTime) {
	// 	// console.log("remote dataaaaa:", this.remoteData);
	// 	if (
	// 		!this.remoteData ||
	// 		!this.remoteData.length ||
	// 		!this.player ||
	// 		!this.player.id
	// 	) {
	// 		return;
	// 	}

	// 	const remotePlayers = [];

	// 	this.remoteData.forEach((data) => {
	// 		if (this.player.id !== data.id) {
	// 			// console.log("lmao");
	// 			let remotePlayer = this.getRemotePlayerById(data.id);
	// 			if (!remotePlayer) {
	// 				remotePlayer = new Player();
	// 				remotePlayer.id = data.id;
	// 				remotePlayer.position.set(data.x, data.y, data.z);
	// 				this.scene.add(remotePlayer.model);
	// 				this.remotePlayers.push(remotePlayer);
	// 			} else {
	// 				remotePlayer.position.set(data.x, data.y, data.z);
	// 			}
	// 		}
	// 	});

	// 	this.remotePlayers = this.remotePlayers.filter((player) => {
	// 		const found = this.remoteData.some((data) => data.id === player.id);
	// 		if (!found) {
	// 			this.scene.remove(player.model); // Usuwamy model gracza ze sceny
	// 		}
	// 		return found; // Zostawiamy tylko tych, którzy nadal istnieją
	// 	});

	// 	this.remotePlayers.forEach((player) => {
	// 		player.update(deltaTime);
	// 	});

	// 	// this.remoteData.forEach((data) => {
	// 	// 	if (game.player.id != data.id) {
	// 	// 		let iPlayer;
	// 	// 		game.initialisingPlayers.forEach((player) => {
	// 	// 			if (player.id == data.id) iPlayer = player;
	// 	// 		});
	// 	// 		if (!iPlayer) {
	// 	// 			let rPlayer;
	// 	// 			game.remotePlayers.forEach((player) => {
	// 	// 				if (player.id == data.id) rPlayer = player;
	// 	// 			});
	// 	// 			if (!rPlayer) {
	// 	// 				game.initialisingPlayers.push(new Player());
	// 	// 			} else {
	// 	// 				remotePlayers.push(rPlayer);
	// 	// 			}
	// 	// 		}
	// 	// 	}
	// 	// });

	// 	// this.scene.children.forEach((object) => {
	// 	// 	if (
	// 	// 		object.userData.remotePlayer &&
	// 	// 		game.getRemotePlayerById(object.userData.id) == undefined
	// 	// 	) {
	// 	// 		game.scene.remove(object);
	// 	// 	}
	// 	// });
	// 	// this.remotePlayers = remotePlayers;
	// 	// this.remotePlayers.forEach(function (player) {
	// 	// 	player.update(dt);
	// 	// });
	// }

	getRemotePlayerById(id) {
		if (this.remotePlayers === undefined || this.remotePlayers.length == 0)
			return;

		const players = this.remotePlayers.filter(function (player) {
			if (player.id == id) return true;
		});

		if (players.length == 0) return;

		return players[0];
	}
}
