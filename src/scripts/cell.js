import * as THREE from "three";

const geometry = new THREE.PlaneGeometry(4, 4);
const material = new THREE.MeshLambertMaterial({
	color: "white",
	wireframe: false,
});

export class Cell extends THREE.Group {
	constructor(rowNum, colNum, parentGrid, parentSize) {
		super();
		this.rowNum = rowNum;
		this.colNum = colNum;
		this.parentGrid = parentGrid;
		this.parentSize = parentSize;

		this.visited = false;
		this.walls = {
			frontWall: {
				exists: true,
				position: new THREE.Vector3(0, 0, 0),
				isSide: false,
			},
			rightWall: {
				exists: true,
				position: new THREE.Vector3(0, 0, 0),
				isSide: true,
			},
			backWall: {
				exists: true,
				position: new THREE.Vector3(0, 0, 0),
				isSide: false,
			},
			leftWall: {
				exists: true,
				position: new THREE.Vector3(0, 0, 0),
				isSide: true,
			},
		};
	}

	checkNeighbours() {
		let grid = this.parentGrid;
		let row = this.rowNum;
		let col = this.colNum;

		let neighbours = [];

		let top = row !== 0 ? grid[row - 1][col] : undefined;
		let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
		let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
		let left = col !== 0 ? grid[row][col - 1] : undefined;

		if (top && !top.visited) neighbours.push(top);
		if (right && !right.visited) neighbours.push(right);
		if (bottom && !bottom.visited) neighbours.push(bottom);
		if (left && !left.visited) neighbours.push(left);

		if (neighbours.length !== 0) {
			let random = Math.floor(Math.random() * neighbours.length);
			return neighbours[random];
		} else {
			return undefined;
		}
	}

	removeWalls(current, next) {
		let x = current.colNum - next.colNum;

		if (x == 1) {
			current.walls.frontWall.exists = false;
			next.walls.backWall.exists = false;
		} else if (x == -1) {
			current.walls.backWall.exists = false;
			next.walls.frontWall.exists = false;
		}

		let y = current.rowNum - next.rowNum;

		if (y == 1) {
			current.walls.rightWall.exists = false;
			next.walls.leftWall.exists = false;
		} else if (y == -1) {
			current.walls.leftWall.exists = false;
			next.walls.rightWall.exists = false;
		}
	}

	toJSON() {
		return {
			rowNum: this.rowNum,
			colNum: this.colNum,
			visited: this.visited,
			walls: this.walls,
		};
	}
}
