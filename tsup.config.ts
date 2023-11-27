import { defineConfig } from "tsup"
import packageJson from "@root/package.json"

const runtimeDependencies = Object.keys(packageJson.dependencies)

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	entry: ["src/main.ts"],
	clean: true,
	dts: false,
	format: "esm",
	target: "node20",
	outDir: "build/dist",
	noExternal: [...runtimeDependencies, "util"],
	treeshake: true,
	outExtension: () => ({ js: ".mjs" })
})
