import { defineConfig } from "tsup"

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	entry: ["src/main.ts"],
	clean: true,
	dts: false,
	format: "esm",
	target: "node20",
	outDir: "build/dist",
	outExtension: () => ({ js: ".mjs" }),
})
