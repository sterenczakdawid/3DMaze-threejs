import * as THREE from "three";
import * as CANNON from "cannon-es";
import { MazeGenerator } from "./maze2";

const cols = 10;
const rows = 10;
export class Environment {
	constructor(
		scene,
		world,
		{ camera = null, debugPanel = null, constants = null } = {}
	) {
		this.scene = scene;
		this.world = world;
		this.camera = camera;
		this.debugPanel = debugPanel;
		this.constants = constants;

		this.initializeEnvironment();
	}

	initializeEnvironment() {
		this.initializeGround();

		if (this.constants.playerEnabled) this.initializePlayer();

		this.initializeMaze();
	}

	initializeLights() {
		let light = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(light);

		light = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(10, 10, 10);
		light.castShadow = true;
		this.scene.add(light);
	}

	initializeGround() {
		const floor = new CANNON.Body({
			shape: new CANNON.Plane(),
			type: CANNON.Body.STATIC,
		});
		floor.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

		const floorMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(300, 300),
			new THREE.MeshBasicMaterial({
				color: 0x909990,
				roughness: 1,
				metalness: 0.2,
				side: THREE.DoubleSide,
			})
		);

		floorMesh.receiveShadow = true;
		floorMesh.rotation.x = -Math.PI * 0.5;
		floorMesh.position.set(25, -1, 25);

		this.scene.add(floorMesh);
		const grid = new THREE.GridHelper(300, 300);
		grid.position.set(25, -1, 25);
		this.world.addBody(floor);
	}

	initializePlayer() {
		this.player = new Player(this.scene, this.world, this.camera);
	}

	initializeMaze() {
		this.maze = new MazeGenerator(this.scene, this.world, {
			cols: cols,
			rows: rows,
			debugPanel: this.debugPanel,
			playerEnabled: this.constants.playerEnabled,
		});
	}

	update(timeElapsed) {
		this.maze.step();
		if (this.constants.playerEnabled) this.player.update(timeElapsed);
	}
}
