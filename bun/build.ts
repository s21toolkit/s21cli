import { resolve } from "node:path"
import process from "node:process"

const { platform, arch } = process

const entrypoint = resolve("bin/index.ts")
const outfile = resolve(`build/s21-${platform}-${arch}`)

Bun.spawnSync({
	cmd: [
		"bun",
		"build",
		...["--compile", entrypoint],
		...["--outfile", outfile],
	],
	stdio: ["inherit", "inherit", "inherit"],
})
