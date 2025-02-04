import { spawnSync } from "node:child_process"
import { defineConfig } from "tsup"

const isDev = process.env.NODE_ENV === "development"

function fetchCurrentCommit() {
	const handle = spawnSync("git", ["rev-parse", "--short", "HEAD"])

	if (handle.error) {
		throw new Error("Failed to fetch git revision (HEAD)")
	}

	return handle.stdout.toString().trim()
}

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	entry: ["src/main.ts"],
	clean: true,
	dts: false,
	sourcemap: isDev,
	format: "esm",
	target: "node20",
	outDir: "build/dist",
	outExtension: () => ({ js: ".mjs" }),
	// https://github.com/egoist/tsup/issues/927#issuecomment-2416440833
	banner: () => ({ js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);` }),
	define: {
		__CURRENT_COMMIT: `"${fetchCurrentCommit()}"`,
	},
})
