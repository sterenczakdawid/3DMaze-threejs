import * as THREE from "three";
import { Cell } from "./cell";

/**
	Textures
 */
const textureLoader = new THREE.TextureLoader();
const floorColorTexture = textureLoader.load(
	"textures/floor/Gravel_001_BaseColor.jpg"
);
const floorAmbientOcclussionTexture = textureLoader.load(
	"textures/floor/Gravel_001_AmbientOcclusion.jpg"
);
const floorNormalTexture = textureLoader.load(
	"textures/floor/Gravel_001_Normal.jpg"
);
const floorRoughnessTexture = textureLoader.load(
	"textures/floor/Gravel_001_Roughness.jpg"
);
floorColorTexture.colorSpace = THREE.SRGBColorSpace;

const wallColorTexture = textureLoader.load(
	"textures/wall/Stylized_Bricks_004_basecolor.png"
);
const wallAmbientOcclussionTexture = textureLoader.load(
	"textures/wall/Stylized_Bricks_004_ambientOcclusion.png"
);
const wallNormalTexture = textureLoader.load(
	"textures/wall/Stylized_Bricks_004_normal.png"
);
const wallRoughnessTexture = textureLoader.load(
	"textures/wall/Stylized_Bricks_004_roughness.png"
);
wallColorTexture.colorSpace = THREE.SRGBColorSpace;

const floorGeometry = new THREE.BoxGeometry(4, 1, 4);
// const floorMaterial = new THREE.MeshLambertMaterial({
// 	color: "limegreen",
// 	wireframe: false,
// });
const floorMaterial = new THREE.MeshStandardMaterial({
	roughness: 1,
	map: floorColorTexture,
	aoMap: floorAmbientOcclussionTexture,
	roughnessMap: floorRoughnessTexture,
	normalMap: floorNormalTexture,
});

const wallGeometry = new THREE.BoxGeometry(4.1, 4.1, 0.2);
// const wallGeometry = new THREE.PlaneGeometry(4, 4);
const wallMaterial = new THREE.MeshStandardMaterial({
	map: wallColorTexture,
	aoMap: wallAmbientOcclussionTexture,
	roughnessMap: wallRoughnessTexture,
	normalMap: wallNormalTexture,
});
wallMaterial.side = THREE.DoubleSide;

let current;

export class Maze extends THREE.Group {
	constructor(size = 5) {
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
		this.clear();
		// this.add(this.currentCellHelper);
		this.initializeCells();
		this.draw();
	}

	draw() {
		this.clear();
		current.visited = true;
		// console.log("Creating floor with texture:", texture);
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				let cube;
				cube = new THREE.Mesh(floorGeometry, floorMaterial);
				cube.position.set(r * 4 + 2, -0.5, c * 4 + 2);
				cube.castShadow = true;
				cube.receiveShadow = true;
				this.add(cube);
			}
		}
		this.drawWalls();

		let next = current.checkNeighbours();

		if (next) {
			next.visited = true;
			this.stack.push(current);
			current.removeWalls(current, next);
			current = next;
		} else if (this.stack.length > 0) {
			let cell = this.stack.pop();
			current = cell;
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
