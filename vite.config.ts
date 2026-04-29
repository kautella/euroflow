import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		TanStackRouterVite({
			routesDirectory: "./src/client/routes",
			generatedRouteTree: "./src/client/routeTree.gen.ts",
		}),
		tailwindcss(),
		react(),
	],
	server: {
		port: 3000,
		proxy: {
			"/api": "http://localhost:3001",
		},
	},
	test: {
		globals: true,
		coverage: { provider: "v8" },
		projects: [
			{
				test: {
					name: "client",
					include: ["src/client/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
					environment: "jsdom",
				},
			},
			{
				test: {
					name: "server",
					include: ["src/server/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
					environment: "node",
				},
			},
		],
	},
});
