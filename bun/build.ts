import { resolve } from "path"

const { platform, arch } = process

const outfile = `build/s21-${platform}-${arch}`

const version = process.env.APP_VERSION ?? "dev"

Bun.spawnSync({
	cmd: [
		"bun",
		"build",
		...["--preload", resolve(import.meta.dir, "preload.ts")],
		...["--compile", "./bin/index.ts"],
		...["--define", `EXTERNAL_APP_VERSION="${version}"`],
		"--minify",
		...["--outfile", outfile],
	],
})
