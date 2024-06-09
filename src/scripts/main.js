import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
import { Maze } from "./maze";
import { Player } from "./player";
import { createGUI } from "./gui";
import { Physics } from "./physics";

const stats = new Stats();
document.body.append(stats.dom);

// /**
//  * Base
//  */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Maze
let maze = new Maze();
maze.generate();
scene.add(maze);

/**
 * Player & physics
 */
const player = new Player(scene);
const physics = new Physics(scene);
player.maxSpeed = 7;
player.cameraHelper.visible = false;
player.boundsHelper.visible = false;
physics.helpers.visible = false;

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0x404040, 4); // Increase intensity for brighter ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x0000ff, 2.0);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// Green light at the entrance
const entranceLight = new THREE.PointLight(0xff0000, 50, 20);
entranceLight.position.set(2, 2, -1);
scene.add(entranceLight);

// Green light at the exit
const exitLight = new THREE.PointLight(0x00ff00, 50, 20);
exitLight.position.set(maze.rows * 4 - 2, 2, maze.columns * 4);
scene.add(exitLight);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	orbitCamera.aspect = sizes.width / sizes.height;
	orbitCamera.updateProjectionMatrix();

	player.camera.aspect = sizes.width / sizes.height;
	player.camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const orbitCamera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	1000
);
// camera.position.set(2, 2, 2);
orbitCamera.position.set(-32, 16, -32);
scene.add(orbitCamera);

// Controls
const controls = new OrbitControls(orbitCamera, canvas);
controls.target.set(16, 0, 16);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

// Timer
let startTime;
let timerInterval;
let isTimerRunning = false;

const timerElement = document.querySelector(".timer");
const restartButton = document.querySelector(".restartButton");
restartButton.addEventListener("click", resetGame);

function startTimer() {
	startTime = Date.now();
	timerInterval = setInterval(() => {
		const elapsedTime = Date.now() - startTime;
		const minutes = Math.floor(elapsedTime / 60000);
		const seconds = Math.floor((elapsedTime % 60000) / 1000);
		timerElement.innerText = `Time: ${minutes}:${
			seconds < 10 ? "0" : ""
		}${seconds}`;
	}, 1000);
	isTimerRunning = true;
}

function stopTimer() {
	// console.log("stopped");
	clearInterval(timerInterval);
	isTimerRunning = false;
}

function resetGame() {
	player.controls.lock();
	player.position.set(2, 2, -10);
	player.camera.lookAt(2, 2, 1);
	player.velocity.set(0, 0, 0);
	scene.remove(maze);
	maze = new Maze();
	maze.generate();
	scene.add(maze);
	restartButton.classList.remove("btn-visible");
	restartButton.classList.add("dn");
	timerElement.innerText = "Time: 0:00";
}

function checkIfPlayerReachedEnd() {
	const endCell = maze.grid[maze.rows - 1][maze.columns - 1];
	if (
		player.position.x >= endCell.rowNum * 4 &&
		player.position.z >= (endCell.colNum + 1) * 4
	) {
		stopTimer();
		player.controls.unlock();
		restartButton.classList.add("btn-visible");
		restartButton.classList.remove("dn");
	}
}

function animate() {
	requestAnimationFrame(animate);

	const currentTime = performance.now();
	const deltaTime = (currentTime - previousTime) / 1000;

	controls.update();
	player.applyInputs(deltaTime);
	player.updateBoundsHelper();
	if (player.position.z > -1 && !isTimerRunning) {
		startTimer();
	}
	physics.update(deltaTime, player, maze);
	checkIfPlayerReachedEnd();

	renderer.render(
		scene,
		player.controls.isLocked ? player.camera : orbitCamera
	);
	stats.update();

	previousTime = currentTime;
}
// const tick = () => {
// 	const elapsedTime = clock.getElapsedTime();
// 	const deltaTime = elapsedTime - previousTime;
// 	previousTime = elapsedTime;

// Update controls
// controls.update();
// firstPersonControls.update(deltaTime);
// player.applyInputs(deltaTime);
// player.updateBoundsHelper();
// physics.update(deltaTime, player, maze);
// maze.draw();

// Render
// renderer.render(scene, camera);
// renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera);

// stats.update();
// Call tick again on the next frame
// window.requestAnimationFrame(tick);
// };

createGUI(maze, player, physics);
// tick();
animate();
