import { version } from "@root/package.json"

function fetchRevision() {
	const subprocess = Bun.spawnSync({
		cmd: ["git", "rev-parse", "--short", "HEAD"],
	})

	if (subprocess.exitCode !== 0) {
		throw new Error("Failed to fetch git revision (HEAD)")
	}

	return subprocess.stdout.toString()
}

export const VERSION = {
	version,
	revision: fetchRevision(),
	get full() {
		return `${this.version} (${this.revision})`
	},
	toString() {
		return this.full
	},
}
