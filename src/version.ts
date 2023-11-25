import { version } from "@root/package.json"

function fetchCurrentCommit() {
	const subprocess = Bun.spawnSync({
		cmd: ["git", "rev-parse", "--short", "HEAD"],
	})

	if (subprocess.exitCode !== 0) {
		throw new Error("Failed to fetch git revision (HEAD)")
	}

	return subprocess.stdout.toString().trim()
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
