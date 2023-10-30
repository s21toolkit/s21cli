import { resolve } from "path"

const { platform, arch } = process

const outfile = `build/s21-${platform}-${arch}`

Bun.spawnSync({
	cmd: [
		"bun",
		"build",
		"--preload",
		resolve(import.meta.dir, "preload.ts"),
		"--compile",
		"./bin/index.ts",
		"--minify",
		"--outfile",
		outfile,
	],
})
