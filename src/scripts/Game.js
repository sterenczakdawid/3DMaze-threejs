import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Maze } from "./maze";
import { Player } from "./Player";
import { Physics } from "./physics";
import { createGUI } from "./gui";
import Timer from "./Timer";
import { CAMERA } from "../constants/constants";

// const stats = new Stats();
// document.body.append(stats.dom);
let instance = null;

export default class Game {
	constructor(canvas, options) {
		if (instance) {
			return instance;
		}
		instance = this;

		this.canvas = canvas;
		this.mode = options.mode;
		this.socket = options.socket;
		this.roomId = options.roomId;

		if (options.mazeData) this.mazeData = options.mazeData;
		if (options.difficulty) this.difficulty = options.difficulty || "easy";
		if (options.algorithm) this.algorithm = options.algorithm || "dfs";
		this.mazeSize =
			this.difficulty === "easy" ? 5 : this.difficulty === "medium" ? 10 : 15;

		this.scene = new THREE.Scene();
		this.sizes = { width: window.innerWidth, height: window.innerHeight };
		this.timer = new Timer();

		this.init();
	}

	init() {
		this.setupCamera();
		this.setupMaze();
		this.setupPlayerAndPhysics();
		this.setupLights();
		this.setupControls();
		this.setupRenderer();

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

	setupCamera() {
		this.orbitCamera = new THREE.PerspectiveCamera(
			CAMERA.FOV,
			this.sizes.width / this.sizes.height,
			CAMERA.NEAR,
			CAMERA.FAR
		);
		this.orbitCamera.position.set(-32, 16, -32);
		this.scene.add(this.orbitCamera);
	}

	setupMaze() {
		if (this.mode === "creator") {
			const mazeOptions = {
				size: this.mazeSize,
			};
			this.maze = new Maze(mazeOptions);
			if (this.algorithm === "dfs") {
				this.maze.generate();
			} else if (this.algorithm === "kruskal") {
				this.maze.generateKruskal();
			}
		} else {
			console.log("obs");
			if (this.mazeData) {
				const mazeOptions = { mazeData: this.mazeData };
				this.maze = new Maze(mazeOptions);
			}
			this.maze.generate();
		}
		this.scene.add(this.maze);
	}

	setupPlayerAndPhysics() {
		this.player = new Player(this.socket, this.roomId);
		this.physics = new Physics(this.scene);
		this.player.maxSpeed = 5;
		this.player.cameraHelper.visible = false;
		this.player.boundsHelper.visible = false;
		this.physics.helpers.visible = false;
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
		// stats.update();
		this.previousTime = currentTime;
	}

	resetGame() {
		this.player.controls.lock();
		this.player.position.set(2, 2, -10);
		this.player.camera.lookAt(2, 2, 1);
		this.player.velocity.set(0, 0, 0);

		this.scene.remove(this.maze);
		this.setupMaze();
		// this.maze = new Maze();
		// this.maze.generate();
		// this.scene.add(this.maze);

		if (this.mode === "creator") {
			setTimeout(() => {
				const newMazeData = this.maze.grid;
				console.log("wysylam maze: ", newMazeData);
				this.socket.emit("updateMaze", {
					roomId: this.roomId,
					maze: newMazeData,
				});
			}, 4000);
		}

		this.restartButton.classList.remove("btn-visible");
		this.restartButton.classList.add("dn");
		this.timer.timerElement.innerText = "Time: 0:00";
	}

	checkIfPlayerReachedEnd() {
		const maze = this.maze;
		const endCell = maze.grid[maze.rows - 1][maze.columns - 1];
		if (
			this.player.position.x >= endCell.rowNum * 4 &&
			this.player.position.z >= (endCell.colNum + 1) * 4
		) {
			this.timer.stopTimer();
			this.player.controls.unlock();
			this.restartButton.classList.add("btn-visible");
			this.restartButton.style.display = "block";
			this.restartButton.classList.remove("dn");
		}
	}

	updateMaze(newMazeData) {
		this.scene.remove(this.maze);
		const mazeOptions = { mazeData: newMazeData };
		this.maze = new Maze(mazeOptions);
		// this.maze = new Maze(5, newMazeData);
		this.maze.generate();
		this.scene.add(this.maze);
		console.log("Labirynt został zaktualizowany");
	}

	setupLights() {
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
	}

	setupControls() {
		this.controls = new OrbitControls(this.orbitCamera, this.canvas);
		this.controls.target.set(16, 0, 16);
		this.controls.enableDamping = true;
	}

	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
		});

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}
}
