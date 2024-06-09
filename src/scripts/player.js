import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/Addons.js";

export class Player {
	radius = 0.5;
	height = 1.8;
	maxSpeed = 5;
	input = new THREE.Vector3();
	velocity = new THREE.Vector3();

	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.1,
		200
	);
	controls = new PointerLockControls(this.camera, document.body);
	cameraHelper = new THREE.CameraHelper(this.camera);

	constructor(scene) {
		this.position.set(2, 2, -10);
		this.camera.lookAt(2, 2, 1);
		scene.add(this.camera);
		scene.add(this.cameraHelper);

		document.addEventListener("keydown", this.onKeyDown.bind(this));
		document.addEventListener("keyup", this.onKeyUp.bind(this));

		this.boundsHelper = new THREE.Mesh(
			new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
			new THREE.MeshBasicMaterial({ wireframe: true })
		);
		scene.add(this.boundsHelper);
	}

	applyInputs(dt) {
		if (this.controls.isLocked) {
			this.velocity.x = this.input.x;
			this.velocity.z = this.input.z;
			this.controls.moveRight(this.velocity.x * dt);
			this.controls.moveForward(this.velocity.z * dt);

			document.getElementById("player-position").innerHTML = this.toString();
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
}
