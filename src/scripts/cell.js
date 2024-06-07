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
			frontWall: { exists: true, position: new THREE.Vector3(0, 0, 0), isSide: false },
			rightWall: { exists: true, position: new THREE.Vector3(0, 0, 0), isSide: true },
			backWall: { exists: true, position: new THREE.Vector3(0, 0, 0), isSide: false },
			leftWall: { exists: true, position: new THREE.Vector3(0, 0, 0), isSide: true },
		};
	}

	drawWalls(size, rows, columns) {
		// let x = (this.colNum * size) / columns;
		// let y = (this.rowNum * size) / rows;
		// let startX = (this.rowNum * size) / rows;
		// let endX = startX + size / rows;
		// let startZ = (this.colNum * size) / columns;
		// let endZ = startZ + size / columns;
		// if (this.walls.frontWall) this.drawFrontWall(x, y, size, columns, rows);
		// if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
		// if (this.walls.backWall) this.drawBackWall(x, y, size, columns, rows);
		// if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
		// if (this.visited) {
		// 	ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
		// }
		// console.log(
		// 	`startX: ${startX}, endX: ${endX}, startZ: ${startZ}, endZ: ${endZ}`
		// );
		// ctx.strokeStyle = "white";
		// ctx.fillStyle = "black";
		// ctx.lineWidth = 2;
		// if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
		// if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
		// if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
		// if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
		// if (this.visited) {
		// 	ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
		// }
	}

	drawTopWall(x, y, size, columns, rows) {
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + size / columns, y);
		ctx.stroke();
	}

	drawRightWall(x, y, size, columns, rows) {}

	drawBottomWall(x, y, size, columns, rows) {}

	drawLeftWall(x, y, size, columns, rows) {}

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

	// 	highlight(columns) {
	// 		let x = (this.colNum * this.parentSize) / columns + 1;
	// 		let y = (this.rowNum * this.parentSize) / columns + 1;

	// 		ctx.fillStyle = "purple";
	// 		ctx.fillRect(
	// 			x,
	// 			y,
	// 			this.parentSize / columns - 3,
	// 			this.parentSize / columns - 3
	// 		);
	// 	}

	// 	removeWalls(cell1, cell2) {
	// 		let x = cell1.colNum - cell2.colNum;

	// 		if (x == 1) {
	// 			cell1.walls.leftWall = false;
	// 			cell2.walls.rightWall = false;
	// 		} else if (x == -1) {
	// 			cell1.walls.rightWall = false;
	// 			cell2.walls.leftWall = false;
	// 		}

	// 		let y = cell1.rowNum - cell2.rowNum;

	// 		if (y == 1) {
	// 			cell1.walls.topWall = false;
	// 			cell2.walls.bottomWall = false;
	// 		} else if (y == -1) {
	// 			cell1.walls.bottomWall = false;
	// 			cell2.walls.topWall = false;
	// 		}
	// 	}

	// 	show(size, rows, columns) {
	// 		let x = (this.colNum * size) / columns;
	// 		let y = (this.rowNum * size) / rows;

	// 		ctx.strokeStyle = "white";
	// 		ctx.fillStyle = "black";
	// 		ctx.lineWidth = 2;

	// 		if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
	// 		if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
	// 		if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
	// 		if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
	// 		if (this.visited) {
	// 			ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
	// 		}
	// 	}
	// }
}
