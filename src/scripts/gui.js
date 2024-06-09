import { GUI } from "lil-gui";

export function createGUI(maze, player, physics) {
	const gui = new GUI();

	const playerFolder = gui.addFolder("Player");
	playerFolder.add(player, "maxSpeed", 2, 100).name("Max Speed");
	playerFolder.add(player.cameraHelper, "visible").name("Show Camera Helper");
	playerFolder.add(player.boundsHelper, "visible").name("Show bounds helper");

	const physicsFolder = gui.addFolder("Physics");
	physicsFolder.add(physics.helpers, "visible").name("Show physics helpers");
}
