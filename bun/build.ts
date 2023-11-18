import { resolve } from "path"

const { platform, arch } = process

const entrypoint = resolve("bin/index.ts")
const outfile = resolve(`build/s21-${platform}-${arch}`)

const version = process.env.APP_VERSION ?? "dev"

Bun.spawnSync({
	cmd: [
		"bun",
		"build",
		...["--compile", entrypoint],
		...["--define", `EXTERNAL_APP_VERSION="${version}"`],
		"--minify",
		...["--outfile", outfile],
	],
	stdio: ["inherit", "inherit", "inherit"],
})
