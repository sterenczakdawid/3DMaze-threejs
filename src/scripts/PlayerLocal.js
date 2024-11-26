import * as THREE from "three";
import { io } from "socket.io-client";
import { Player } from "./Player";

export default class PlayerLocal extends Player {
	maxSpeed = 5;
	input = new THREE.Vector3();
	velocity = new THREE.Vector3();

	constructor() {
		// console.log("nowy zawodnik lokalny");
		super();
		this.role = null;
		// this.socket = io("http://localhost:3000");
		this.position.set(2, 2, -10);
		this.camera.lookAt(2, 2, 1);
		this.game.scene.add(this.camera);
		this.game.scene.add(this.cameraHelper);

		// document.addEventListener("keydown", this.onKeyDown.bind(this));
		// document.addEventListener("keyup", this.onKeyUp.bind(this));

		const player = this;

		// const socket = io("http://localhost:3000");
		// this.socket.on("connect", () => {
		// 	console.log("new connection");
		// });

		// this.socket.on("setId", (data) => {
		// 	console.log("otrzymalem id: ", data.id);
		// 	this.id = data.id;
		// });
		// this.socket.on("assignRole", (data) => {
		// 	this.role = data.role;
		// 	console.log(`Assigned role: ${this.role}`);
		// });
		// this.socket.on("remoteData", (data) => {
		// 	// console.log("remote data: ", data);
		// 	this.game.remoteData = data;
		// });
		// this.socket.on("deletePlayer", (data) => {
		// 	this.game.remotePlayers = this.game.remotePlayers.filter(
		// 		(player) => player.id !== data.id
		// 	);
		// });
		// socket.on("deletePlayer", (data) => {
		// 	const players = this.game.remotePlayers.filter(
		// 		(player) => player.id == data.id
		// 	);
		// 	if (players.length > 0) {
		// 		let index = this.game.remotePlayers.indexOf(players[0]);
		// 		if (index != -1) {
		// 			this.game.remotePlayers.splice(index, 1);
		// 			// this.game.scene.remove(players[0]);
		// 		}
		// 	} else {
		// 		index = this.game.initialisingPlayers.indexOf(data.id);
		// 		if (index != -1) {
		// 			const player = this.game.initialisingPlayers(index);
		// 			player.deleted = true;
		// 			this.game.initialisingPlayers.splice(index, 1);
		// 		}
		// 	}
		// });

		// this.socket = socket;
	}

	initSocket() {
		this.socket.emit("init", {
			x: this.position.x,
			y: this.position.y,
			z: this.position.z,
		});
	}

	updateSocket() {
		// console.log("update socket");
		if (this.socket !== undefined) {
			this.socket.emit("update", {
				x: this.position.x,
				y: this.position.y,
				z: this.position.z,
			});
		}
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

			document.getElementById("player-position").innerHTML = this.toString();
		}
		this.updateSocket();
	}
}
