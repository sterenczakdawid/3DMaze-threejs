import restart from "vite-plugin-restart";

export default {
	root: "src/",
	publicDir: "../static/",
	base: "./",
	server: {
		host: true, // Open to local network and display URL
		open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env), // Open if it's not a CodeSandbox
		// proxy: {
		// 	'/socket.io' {
		// 		target: 'http://localhost:3000',
		// 		ws: true,
		// 	},
		// }
	},
	build: {
		outDir: "../dist", // Output in the dist/ folder
		emptyOutDir: true, // Empty the folder first
		sourcemap: true, // Add sourcemap
	},
	plugins: [
		restart({ restart: ["../static/**"] }), // Restart server on static file change
	],
};
