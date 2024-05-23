import { spawn } from "node:child_process"
import { resolve } from "node:path"

const targets = [
	"linux-x64",
	"linux-arm64",
	"darwin-x64",
	"darwin-arm64",
	"windows-x64",
]

const entrypoint = resolve("build/dist/main.mjs")

const buildProcesses = []

for (const target of targets) {
	const outfile = resolve(`build/bin/s21-${target}`)

	const process = spawn("pnpm", [
		"bun",
		"build",
		"--compile",
		entrypoint,
		"--target",
		`bun-${target}`,
		"--minify",
		"--sourcemap",
		"--define",
		"__BINARY_BUILD=true",
		"--outfile",
		outfile,
	])

	buildProcesses.push(process)
}

await Promise.all(
	buildProcesses.map(
		(process) => new Promise((resolve) => process.on("close", resolve)),
	),
)
