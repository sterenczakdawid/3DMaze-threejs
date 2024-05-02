import { GUI } from "lil-gui";

export function createGUI(maze, player) {
	const gui = new GUI();

	const playerFolder = gui.addFolder("Player");
	playerFolder.add(player, "maxSpeed", 2, 100).name("Max Speed");
	playerFolder.add(player.cameraHelper, "visible").name("Show Camera Helper");
}
