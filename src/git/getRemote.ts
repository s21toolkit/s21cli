export function getRemote() {
	const proc = Bun.spawnSync(["git", "remote", "get-url", "origin"])

	if (proc.exitCode !== 0) {
		throw new Error("Failed to get origin remote.")
	}

	return proc.stdout.toString()
}
