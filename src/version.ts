import { version } from "@root/package.json"

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __CURRENT_COMMIT: string

export const VERSION = {
	version,
	commit: __CURRENT_COMMIT,
	get full() {
		return `${this.version} (commit ${this.commit})`
	},
	toString() {
		return this.full
	},
}
