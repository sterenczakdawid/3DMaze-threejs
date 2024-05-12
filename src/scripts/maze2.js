import * as THREE from "three";
import { Cell } from "./Cell2";

export class MazeGenerator {
	constructor(
		scene,
		world,
		{ cols = 5, rows = 5, debugPanel = null, playerEnabled = true } = {}
	) {
		this.playerEnabled = playerEnabled;
		this.scene = scene;
		this.world = world;
		this.cols = cols;
		this.rows = rows;

		this.debugPanel = debugPanel;

		this.cells = [];
		this.maze = [];

		this.current = null;
		this.cellStack = [];

		this.initializeCells();

		this.currentCellHelper = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2).translate(0, 1, 0),
			new THREE.MeshStandardMaterial({ color: 0xc91ea4 })
		);
		this.scene.add(this.currentCellHelper);
	}

	initializeCells() {
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {
				const cell = new Cell(this.scene, this.world, i, j, [], {
					debugPanel: this.debugPanel,
					playerEnabled: this.playerEnabled,
				});
				this.cells.push(cell);
			}
		}

		this.current = this.cells[0];
		this.cellStack.push(this.current);
	}

	showMaze() {
		for (let i = 0; i < this.cells.length; i++) {
			this.cells[i].update();
		}
	}

	step() {
		if (this.cellStack.length > 0) {
			this.current = this.cellStack[this.cellStack.length - 1];
			this.current.visited = true;

			this.currentCellHelper.position.copy(
				this.current.position.clone().sub(new THREE.Vector3(0, 1, 0))
			);

			console.log(this.current);

			this.showMaze();

			let next = this.current.checkNeighbours(this.cells);
			if (next) {
				this.cellStack.push(next);
			} else {
				this.cellStack.pop();
			}
			return true;
		} else {
			return false;
		}
	}
}
