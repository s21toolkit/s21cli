import { spawnSync } from "node:child_process"

export function getRemote() {
	const handle = spawnSync("git", ["remote", "get-url", "origin"])

	if (handle.error) {
		throw new Error("Failed to get origin remote.")
	}

	return handle.stdout.toString()
}
