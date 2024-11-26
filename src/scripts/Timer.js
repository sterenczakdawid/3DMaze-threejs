import Game from "./Game";

export default class Timer {
	constructor() {
		this.game = new Game();
		// this.game = new Game(document.querySelector("canvas.webgl"));
		// this.previousTime = 0;
		this.isTimerRunning = false;
		this.timerElement = document.querySelector(".timer");
		// this.restartButton = document.querySelector(".restartButton");
		// this.restartButton.addEventListener("click", () => {
		// 	this.resetGame();
		// });
	}

	// update() {
	// 	const currentTime = performance.now();
	// 	this.previousTime = currentTime;
	// }

	startTimer() {
		const startTime = Date.now();
		this.timerInterval = setInterval(() => {
			const elapsedTime = Date.now() - startTime;
			const minutes = Math.floor(elapsedTime / 60000);
			const seconds = Math.floor((elapsedTime % 60000) / 1000);
			this.timerElement.innerText = `Time: ${minutes}:${
				seconds < 10 ? "0" : ""
			}${seconds}`;
		}, 1000);
		this.isTimerRunning = true;
	}

	stopTimer() {
		// console.log("stopped");
		clearInterval(this.timerInterval);
		this.isTimerRunning = false;
	}
}
