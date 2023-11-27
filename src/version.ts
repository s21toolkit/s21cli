import { spawnSync } from "node:child_process"
import { version } from "@root/package.json"

function fetchCurrentCommit() {
	const handle = spawnSync("git", ["rev-parse", "--short", "HEAD"])

	if (handle.error) {
		throw new Error("Failed to fetch git revision (HEAD)")
	}

	return handle.stdout.toString().trim()
}

export const VERSION = {
	version,
	commit: fetchCurrentCommit(),
	get full() {
		return `${this.version} (commit ${this.commit})`
	},
	toString() {
		return this.full
	},
}
