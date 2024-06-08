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
const maze = new Maze();
// maze.initializeCells();
maze.generate();
// console.log(maze);
// maze.setup();
// console.log(maze);
// maze.draw();
scene.add(maze);

/**
 * Player & physics
 */
const player = new Player(scene);
const physics = new Physics(scene);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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

// // // Controls
const controls = new OrbitControls(orbitCamera, canvas);
// controls.target.set(0, 0.75, 0);
controls.target.set(16, 0, 16);
controls.enableDamping = true;

// const firstPersonControls = new FirstPersonControls(camera, canvas);
// camera.position.set(2, 2, 2);
// firstPersonControls.lookAt(0, 0, 0); // Patrz na środek sceny

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

function animate() {
	requestAnimationFrame(animate);

	const currentTime = performance.now();
	const deltaTime = (currentTime - previousTime) / 1000;

	// Only update physics when player controls are locked
	// if (player.controls.isLocked) {
	controls.update();
	player.applyInputs(deltaTime);
	player.updateBoundsHelper();
	physics.update(deltaTime, player, maze);

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

createGUI(maze, player);
// tick();
animate();
