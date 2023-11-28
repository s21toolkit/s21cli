import { spawnSync } from "node:child_process"
import { resolve } from "node:path"
import process from "node:process"

const { platform, arch } = process

const entrypoint = resolve("build/dist/main.mjs")
const outfile = resolve(`build/bin/s21-${platform}-${arch}`)

spawnSync("pnpm", [
	"bun",
	"build",
	"--compile",
	entrypoint,
	"--define",
	"BINARY_BUILD=true",
	"--outfile",
	outfile,
])
