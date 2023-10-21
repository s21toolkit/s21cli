const { platform, arch } = process

const outfile = `build/s21-${platform}-${arch}`

Bun.spawnSync({
	cmd: [
		"bun",
		"build",
		"--compile",
		"./bin/index.ts",
		"--minify",
		"--outfile",
		outfile,
	],
})
