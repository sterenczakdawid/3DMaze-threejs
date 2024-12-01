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
	// constructor(size = 5, data = null) {
	constructor(options) {
		console.log("options maze", options);
		super();
		if (options.mazeData) {
			this.data = options.mazeData;
		}
		if (options.size) {
			this.size = options.size * 4;
		} else {
			if (options.mazeData) {
				this.size = options.mazeData.length * 4;
			}
		}
		console.log("size", this.size);
		console.log("data", this.data);
		// this.size = size * 4;
		this.rows = this.size / 4;
		this.columns = this.size / 4;
		this.grid = [];
		this.stack = [];
		this.sets = {}; // Zbiory komórek połączonych korytarzami
		this.cells = {}; // Przypisanie komórek do zbiorów

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
		// current = this.grid[0][0];
		current = this.getCell(0, 0);

		// this.grid[0][0].frontWall.exists = false;
		// this.grid[this.rows - 1][this.columns - 1].backWall.exists = false;
		this.grid[0][0].walls.frontWall.exists = false;
		this.grid[this.rows - 1][this.columns - 1].walls.backWall.exists = false;
	}

	initializeCellsFromData(data) {
		// 	return mazeData.map(row =>
		// 		row.map(cell => {
		// 				const deserializedCell = new Cell(cell.rowNum, cell.colNum, null, null);
		// 				deserializedCell.visited = cell.visited;
		// 				deserializedCell.walls = cell.walls;
		// 				return deserializedCell;
		// 		})
		// );
		// console.log("z datą.", data);
		for (let r = 0; r < data.length; r++) {
			let row = [];
			for (let c = 0; c < data[0].length; c++) {
				const cellData = data[r][c];
				// console.log("celldata: ", cellData);
				const cell = new Cell(
					cellData.rowNum,
					cellData.colNum,
					this.grid,
					this.size
				);
				cell.visited = cellData.visited;
				cell.walls = cellData.walls;
				row.push(cell);
			}
			this.grid.push(row);
		}
		console.log("grid", this.grid);
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
		// return new Promise((resolve) => {
		if (this.data) {
			this.initializeCellsFromData(this.data);
			this.draw();
			// resolve();
		} else {
			this.initializeCells();
			this.draw();
		}
		// });
	}

	draw() {
		this.clear();
		// console.log("generate dfs");
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
		wall.position.set(startX + dims - 2, 1, startZ);
		// cell.frontWall.position = wall.position;
		cell.walls.frontWall.position = wall.position;
		wall.castShadow = true;
		wall.receiveShadow = true;
		this.add(wall);
	}

	drawRightWall(cell, startX, startZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX, 1, startZ + 2);
		// cell.rightWall.position = wall.position;
		cell.walls.rightWall.position = wall.position;
		wall.rotation.y += Math.PI / 2;
		wall.castShadow = true;
		wall.receiveShadow = true;
		this.add(wall);
	}

	drawBackWall(cell, startX, startZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX + dims - 2, 1, startZ + dims);
		// cell.backWall.position = wall.position;
		cell.walls.backWall.position = wall.position;
		wall.castShadow = true;
		wall.receiveShadow = true;
		this.add(wall);
	}

	drawLeftWall(cell, startX, startZ, dims) {
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.position.set(startX + dims, 1, startZ + 2);
		// cell.leftWall.position = wall.position;
		cell.walls.leftWall.position = wall.position;
		wall.rotation.y += Math.PI / 2;
		wall.castShadow = true;
		wall.receiveShadow = true;
		this.add(wall);
	}

	// Kruskal's
	generateKruskal() {
		console.log("kruskal");
		this.clear();
		this.initializeCells();

		const edges = [];
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				const cell = this.grid[r][c];
				if (r < this.rows - 1) {
					edges.push({
						cell,
						neighbor: this.grid[r + 1][c],
						direction: "bottom",
					});
				}
				if (c < this.columns - 1) {
					edges.push({
						cell,
						neighbor: this.grid[r][c + 1],
						direction: "right",
					});
				}
			}
		}
		// console.log(edges);
		this.shuffleArray(edges);
		const parent = Array.from(
			{ length: this.rows * this.columns },
			(_, index) => index
		);
		console.log("parent", parent);
		edges.forEach((edge) => {
			const cellIndex = edge.cell.rowNum * this.columns + edge.cell.colNum;
			const neighborIndex =
				edge.neighbor.rowNum * this.columns + edge.neighbor.colNum;

			// Find roots of each set
			const root1 = this.find(parent, cellIndex);
			const root2 = this.find(parent, neighborIndex);

			if (root1 !== root2) {
				// Connect cells
				edge.cell.removeWalls(edge.cell, edge.neighbor);
				parent[root1] = root2;
			}
		});
		// console.log("edges shuffled: ", edges);
		// const randomIndex = Math.floor(Math.random() * edges.length);
		// console.log(randomIndex);
		this.drawKruskal();
	}
	drawKruskal() {
		console.log("draw kruskal");
		this.clear();
		// Draw floor
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				const cube = new THREE.Mesh(floorGeometry, floorMaterial);
				cube.position.set(r * 4 + 2, -0.5, c * 4 + 2);
				cube.castShadow = true;
				cube.receiveShadow = true;
				this.add(cube);
			}
		}
		this.drawWalls();
	}
	find(parent, i) {
		if (parent[i] === i) return i;
		return (parent[i] = this.find(parent, parent[i])); // Path compression
	}

	shuffleArray(array) {
		for (let i = array.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}

	populate(row) {
		for (let c = 0; c < this.width; c++) {
			if (!this.cells[`${row}-${c}`]) {
				const setId = this.nextSet++;
				this.addCellToSet(row, c, setId);
			}
		}
	}

	addCellToSet(row, col, setId) {
		const key = `${row}-${col}`;
		this.cells[key] = setId;
		if (!this.sets[setId]) this.sets[setId] = [];
		this.sets[setId].push(key);
	}

	mergeSets(row, cell1, cell2) {
		const set1 = this.cells[`${row}-${cell1}`];
		const set2 = this.cells[`${row}-${cell2}`];

		if (set1 !== set2) {
			this.sets[set1] = this.sets[set1].concat(this.sets[set2]);
			this.sets[set1].forEach((cellKey) => {
				this.cells[cellKey] = set1;
			});
			delete this.sets[set2];
		}
	}

	drawMaze() {
		// Tworzy wizualizację na podstawie gridu po zakończeniu generowania
		this.clear();
		for (let r = 0; r < this.height; r++) {
			for (let c = 0; c < this.width; c++) {
				const cube = new THREE.Mesh(floorGeometry, floorMaterial);
				cube.position.set(r * 4 + 2, -0.5, c * 4 + 2);
				cube.castShadow = true;
				cube.receiveShadow = true;
				this.add(cube);
			}
		}
		this.drawWalls();
	}
}
