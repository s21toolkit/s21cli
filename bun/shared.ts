function throwCommandFailedError(argv: string[]) {
	throw new Error(
		`Command failed: [${argv.map((arg) => `"${arg}"`).join(", ")}`,
	)
}

export function run(...argv: string[]) {
	return Bun.spawnSync({
		cmd: argv,
		stderr: "inherit",
		stdout: "inherit",
		stdin: "inherit",
	})
}

export function mustRun(...argv: string[]) {
	const subprocess = run(...argv)

	if (!subprocess.success) {
		throwCommandFailedError(argv)
	}
}

export function runPipe(...argv: string[]) {
	return Bun.spawnSync({
		cmd: argv,
		stderr: "inherit",
		stdout: "pipe",
		stdin: "inherit",
	})
}

export function mustRunPipe(...argv: string[]) {
	const subprocess = runPipe(...argv)

	if (!subprocess.success) {
		throwCommandFailedError(argv)
	}

	return subprocess.stdout.toString()
}
