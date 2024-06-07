import * as THREE from "three";
import { Cell } from "./cell";

const geometry = new THREE.BoxGeometry(4, 1, 4);
const material = new THREE.MeshLambertMaterial({
	color: "limegreen",
	wireframe: false,
});
const material0 = new THREE.MeshLambertMaterial({
	color: "yellow",
	wireframe: false,
});
const material1 = new THREE.MeshLambertMaterial({
	color: "tomato",
	wireframe: false,
});

// const wallGeometry = new THREE.BoxGeometry(4.1, 4.1, 0.2);
const wallGeometry = new THREE.PlaneGeometry(4, 4);
const wallMaterial = new THREE.MeshLambertMaterial({ color: "royalblue" });
// plane.material.side = THREE.DoubleSide;
wallMaterial.side = THREE.DoubleSide;

let current;

export class Maze extends THREE.Group {
	constructor(size = 10) {
		super();
		this.size = size * 4;
		this.rows = size;
		this.columns = size;
		this.grid = [];
		this.stack = [];

		this.currentCellHelper = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1).translate(0, 1, 0),
			new THREE.MeshStandardMaterial({ color: 0xc91ea4 })
		);
	}

	initializeCells() {
		for (let r = 0; r < this.rows; r++) {
			let row = [];
			for (let c = 0; c < this.columns; c++) {
				const cell = new Cell(r, c, this.grid, this.size);
				row.push(cell);
			}
			this.grid.push(row);
		}
		current = this.grid[0][0];

		this.grid[0][0].walls.frontWall.exists = false;
		this.grid[this.rows - 1][this.columns - 1].walls.backWall.exists = false;
	}

	getCell(x, y) {
		if (x >= 0 && x < this.grid.length && y >= 0 && y < this.grid.length)
			return this.grid[x][y];
	}

	generate() {
		// this.clear();
		this.add(this.currentCellHelper);
		this.initializeCells();
		this.draw();
	}

	draw() {
		this.clear();
		current.visited = true;
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				let cube;
				// if (r == 0) {
				// 	cube = new THREE.Mesh(geometry, material0);
				// } else if (c == 1) {
				// 	cube = new THREE.Mesh(geometry, material1);
				// } else {
				cube = new THREE.Mesh(geometry, material);
				// }
				cube.position.set(r * 4 + 2, -0.5, c * 4 + 2);
				cube.castShadow = true;
				cube.receiveShadow = true;
				this.add(cube);
			}
		}
		this.drawWalls();

		let next = current.checkNeighbours();
		// console.log("current: ", current.rowNum, current.colNum);
		// console.log("next: ", next.rowNum, next.colNum);

		if (next) {
			next.visited = true;

			this.stack.push(current);

			// 	// current.highlight(this.columns);

			current.removeWalls(current, next);

			current = next;
		} else if (this.stack.length > 0) {
			let cell = this.stack.pop();
			current = cell;
			// 	// current.highlight(this.columns);
		}

		if (this.stack.length == 0) {
			return;
		}

		window.requestAnimationFrame(() => {
			this.draw();
		});
	}

	drawWalls() {
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				let cell = this.grid[r][c];
				let startX = (cell.rowNum * this.size) / this.rows;
				let startZ = (cell.colNum * this.size) / this.columns;
				let dims = this.size / this.rows;
				if (cell.walls.frontWall.exists)
					this.drawFrontWall(cell, startX, startZ, dims);
				if (cell.walls.rightWall.exists)
					this.drawRightWall(cell, startX, startZ, dims);
				if (cell.walls.backWall.exists)
					this.drawBackWall(cell, startX, startZ, dims);
				if (cell.walls.leftWall.exists)
					this.drawLeftWall(cell, startX, startZ, dims);
				if (cell.visited) {
				}
			}
		}
	}

	drawFrontWall(cell, startX, startZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX + dims - 2, 2, startZ);
		cell.walls.frontWall.position = wall.position;
		wall.castShadow = true;
		wall.receiveShadow = true;
		this.add(wall);
	}

	drawRightWall(cell, startX, startZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX, 2, startZ + 2);
		cell.walls.rightWall.position = wall.position;
		wall.rotation.y += Math.PI / 2;
		wall.castShadow = true;
		wall.receiveShadow = true;
		this.add(wall);
	}

	drawBackWall(cell, startX, startZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX + dims - 2, 2, startZ + dims);
		cell.walls.backWall.position = wall.position;
		wall.castShadow = true;
		wall.receiveShadow = true;
		this.add(wall);
	}

	drawLeftWall(cell, startX, startZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX + dims, 2, startZ + 2);
		cell.walls.leftWall.position = wall.position;
		wall.rotation.y += Math.PI / 2;
		wall.castShadow = true;
		wall.receiveShadow = true;
		this.add(wall);
	}
}
