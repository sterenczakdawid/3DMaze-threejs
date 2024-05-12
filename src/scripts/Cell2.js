import * as THREE from "three";

export class Cell {
	constructor(scene, world, x, z, walls, { debugPanel = null, playerEnabled = true } = {}) {
		this.scene = scene;
		this.world = world;
		this.x = x;
		this.z = z;
		this.visited = false;
		this.walls = walls;
		this.debugPanel = debugPanel;
		this.playerEnabled = playerEnabled;

		this.position = new THREE.Vector3(x * 2, 0, z * 2);

		this.geometry = new THREE.BoxGeometry(2, 2, 2);
		this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.copy(this.position);
		this.scene.add(this.mesh);
	}

	update() {
		if (this.visited) {
			this.material.color.setHex(0xff0000);
		} else {
			this.material.color.setHex(0xffffff);
		}
	}

	checkNeighbours(cells) {
		const neighbours = [];
		const { x, z } = this;

		const top = cells.find(cell => cell.x === x && cell.z === z - 1);
		const right = cells.find(cell => cell.x === x + 1 && cell.z === z);
		const bottom = cells.find(cell => cell.x === x && cell.z === z + 1);
		const left = cells.find(cell => cell.x === x - 1 && cell.z === z);

		if (top && !top.visited) {
			neighbours.push(top);
		}
		if (right && !right.visited) {
			neighbours.push(right);
		}
		if (bottom && !bottom.visited) {
			neighbours.push(bottom);
		}
		if (left && !left.visited) {
			neighbours.push(left);
		}

		if (neighbours.length > 0) {
			const randomIndex = Math.floor(Math.random() * neighbours.length);
			return neighbours[randomIndex];
		} else {
			return undefined;
		}
	}
  
}
