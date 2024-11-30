import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Game from "./Game";

export class Player {
	radius = 0.5;
	height = 1.8;
	maxSpeed = 5;
	input = new THREE.Vector3();
	velocity = new THREE.Vector3();
	model = null; // Definiujemy właściwość modelu gracza
	mixer = null;

	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.1,
		200
	);
	controls = new PointerLockControls(this.camera, document.body);
	cameraHelper = new THREE.CameraHelper(this.camera);

	constructor(socket, roomId) {
		// console.log("new game w player");
		this.game = new Game();
		this.socket = socket;
		this.roomId = roomId;
		this.role = null;
		// console.log(this.game);
		// console.log("nowy zawodnik");
		this.position.set(2, 2, -10);
		this.camera.lookAt(2, 2, 1);
		this.game.scene.add(this.camera);
		this.game.scene.add(this.cameraHelper);

		this.loadModel(this.game.scene);

		document.addEventListener("keydown", this.onKeyDown.bind(this));
		document.addEventListener("keyup", this.onKeyUp.bind(this));

		this.boundsHelper = new THREE.Mesh(
			new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
			new THREE.MeshBasicMaterial({ wireframe: true })
		);
		this.game.scene.add(this.boundsHelper);

		this.initSocket();
	}

	initSocket() {
		this.socket.on("assignRole", (data) => {
			this.role = data.role;
			console.log(`Assigned role: ${this.role}`);
			if (this.role === "Spectator") {
				this.socket.on("hostPositionUpdate", (data) => {
					this.updateHostPosition(data);
				});

				this.socket.on("hostDisconnected", () => {
					alert("Host left the game");
				});
			}
		});
	}

	updateSocket() {
		if (this.socket && this.role === "Host") {
			this.socket.emit("updatePosition", {
				roomId: this.roomId,
				x: this.position.x,
				y: this.position.y,
				z: this.position.z,
			});
		}
	}

	loadModel(scene) {
		const loader = new GLTFLoader();
		loader.load("/models/Character.glb", (gltf) => {
			// console.log("gltf", gltf);
			// scene.add(gltf.scene);

			// mixer = new THREE.AnimationMixer(gltf.scene);
			// const action = mixer.clipAction(gltf.animations[0]);
			// action.play();
			// console.log(gltf);
			this.model = gltf.scene;
			this.model.position.copy(this.position); // Ustawienie modelu w pozycji kamery
			this.model.position.y = 0; // Ustawienie modelu na ziemi
			scene.add(this.model);
			const lol = gltf.animations.findIndex((anim) => anim.name == "Idle");
			// gltf.animations.forEach((animation) => {
			// 	console.log(animation.name);
			// });
			// const idleAnimation = gltf.animations.find("Idle");
			// console.log(idleAnimation);
			// console.log(lol);
			this.mixer = new THREE.AnimationMixer(this.model);
			if (gltf.animations.length > 0) {
				const action = this.mixer.clipAction(gltf.animations[12]);
				action.play();
			}
		});
	}

	applyInputs(dt) {
		if (this.role === "Host" && this.controls.isLocked) {
			this.velocity.x = this.input.x;
			this.velocity.z = this.input.z;
			this.controls.moveRight(this.velocity.x * dt);
			this.controls.moveForward(this.velocity.z * dt);
			// Aktualizacja pozycji modelu gracza
			if (this.model) {
				this.model.position.copy(this.camera.position);
				this.model.position.y = 0;
				this.model.rotation.y = this.camera.rotation.y;
			}

			this.updateSocket();

			document.getElementById("player-position").innerHTML = this.toString();
		} else if (this.role === "Spectator") {
			// console.log("idk spectator?");
		}
	}

	get position() {
		return this.camera.position;
	}

	onKeyDown(event) {
		if (!this.controls.isLocked) {
			this.controls.lock();
		}

		switch (event.code) {
			case "KeyW":
				this.input.z = this.maxSpeed;
				break;
			case "KeyA":
				this.input.x = -this.maxSpeed;
				break;
			case "KeyS":
				this.input.z = -this.maxSpeed;
				break;
			case "KeyD":
				this.input.x = this.maxSpeed;
				break;
			case "KeyR":
				this.position.set(10, 16, 10);
				this.velocity.set(0, 0, 0);
				break;
		}
	}

	onKeyUp(event) {
		switch (event.code) {
			case "KeyW":
				this.input.z = 0;
				break;
			case "KeyA":
				this.input.x = 0;
				break;
			case "KeyS":
				this.input.z = 0;
				break;
			case "KeyD":
				this.input.x = 0;
				break;
		}
	}

	toString() {
		let str = "";
		str += `X: ${this.position.x.toFixed(3)}, `;
		str += `Y: ${this.position.y.toFixed(3)}, `;
		str += `Z: ${this.position.z.toFixed(3)}, `;
		return str;
	}

	updateBoundsHelper() {
		this.boundsHelper.position.copy(this.camera.position);
		this.boundsHelper.position.y -= this.height / 2;
	}

	update(deltaTime) {
		if (this.role === "Spectator" && this.hostData) {
			// console.log("lmao");
			this.model.position.set(this.hostData.x, 0, this.hostData.z);
		} else if (this.mixer) {
			this.mixer.update(deltaTime);
		}
		// if (this.mixer) {
		// 	this.mixer.update(deltaTime);
		// }
		// if (this.game.remoteData.length > 0) {
		// 	let found = false;
		// 	for (let data of this.game.remoteData) {
		// 		if (data.id != this.id) continue;
		// 		//Found the player
		// 		this.position.set(data.x, data.y, data.z);
		// 		found = true;
		// 	}
		// 	// if (!found) this.game.removePlayer(this);
		// }
	}

	updateHostPosition(data) {
		this.hostData = data;
	}
}
