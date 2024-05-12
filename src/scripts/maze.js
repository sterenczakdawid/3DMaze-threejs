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

const wallGeometry = new THREE.BoxGeometry(4, 4, 0.2);
const wallMaterial = new THREE.MeshBasicMaterial({ color: "royalblue" });

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

		// this.grid[0][0].walls.frontWall = false;
	}

	generate() {
		this.clear();
		this.add(this.currentCellHelper);
		this.initializeCells();
		// for (let x = 0; x < this.size; x++) {
		// 	for (let z = 0; z < this.size; z++) {
		// 		const cube = new THREE.Mesh(geometry, material);
		// 		cube.position.set(x * 4.2, 0, z * 4.2);
		// 		this.add(cube);
		// 	}
		// }
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				let cube;
				if (r == 0) {
					cube = new THREE.Mesh(geometry, material0);
				} else if (c == 1) {
					cube = new THREE.Mesh(geometry, material1);
				} else {
					cube = new THREE.Mesh(geometry, material);
				}
				cube.position.set(r * 4 + 2, 0, c * 4 + 2);
				this.add(cube);
				// let grid = this.grid;
				// const wall = new THREE.Mesh(wallGeometry, wallMaterial);
				// wall.position.set(r * 4 + 2, 2, c * 4 + 2);
				// wall.rotation.x -= Math.PI;
				// this.add(wall);

				// console.log(grid);
				// console.log("przekazuję: ", this.size, this.rows, this.columns);
				// grid[r][c].drawWalls(this.size, this.rows, this.columns);
			}
		}
		this.draw();

		// // const floor = new THREE.Mesh(new THREE.BoxGeometry(32, 32, 0.5), material);
		// // floor.rotation.x -= Math.PI / 2;
		// // floor.position.set(16, -0.25, 16);
		// // this.add(floor);
	}

	draw() {
		current.visited = true;
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
		this.clear();
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				let cell = this.grid[r][c];
				let startX = (cell.rowNum * this.size) / this.rows;
				let endX = startX + this.size / this.rows;
				let startZ = (cell.colNum * this.size) / this.columns;
				let dims = this.size / this.rows;
				let endZ = startZ + this.size / this.columns;
				if (cell.walls.frontWall)
					this.drawFrontWall(startX, startZ, endX, endZ, dims);
				if (cell.walls.rightWall)
					this.drawRightWall(startX, startZ, endX, endZ, dims);
				if (cell.walls.backWall)
					this.drawBackWall(startX, startZ, endX, endZ, dims);
				if (cell.walls.leftWall)
					this.drawLeftWall(startX, startZ, endX, endZ, dims);
				if (cell.visited) {}
			}
		}
	}

	drawFrontWall(startX, startZ, endX, endZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX + dims - 2, 2, startZ);
		this.add(wall);
	}

	drawRightWall(startX, startZ, endX, endZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX, 2, startZ + 2);
		wall.rotation.y += Math.PI / 2;
		this.add(wall);
	}

	drawBackWall(startX, startZ, endX, endZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX + dims - 2, 2, startZ + dims);
		this.add(wall);
	}

	drawLeftWall(startX, startZ, endX, endZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX + dims, 2, startZ + 2);
		wall.rotation.y += Math.PI / 2;
		this.add(wall);
	}
}

// 	draw() {
// 		maze.width = this.size;
// 		maze.height = this.size;
// 		maze.style.background = "black";
// 		current.visited = true;

// 		for (let r = 0; r < this.rows; r++) {
// 			for (let c = 0; c < this.columns; c++) {
// 				let grid = this.grid;
// 				grid[r][c].show(this.size, this.rows, this.columns);
// 			}
// 		}

// 		let next = current.checkNeighbours();

// 		if (next) {
// 			next.visited = true;

// 			this.stack.push(current);

// 			current.highlight(this.columns);

// 			current.removeWalls(current, next);

// 			current = next;
// 		} else if (this.stack.length > 0) {
// 			let cell = this.stack.pop();
// 			current = cell;
// 			current.highlight(this.columns);
// 		}

// 		if (this.stack.length == 0) {
// 			return;
// 		}

// 		window.requestAnimationFrame(() => {
// 			this.draw();
// 		});
// 	}
// }
