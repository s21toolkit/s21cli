import type { Store } from "cache-manager"

/**
 * Noop cache store
 */
export const NoopStore: Store = {
	del() {
		return Promise.resolve()
	},

	keys() {
		return Promise.resolve([])
	},

	get() {
		return Promise.resolve(undefined)
	},

	mdel() {
		return Promise.resolve()
	},

	mget() {
		return Promise.resolve([])
	},

	mset() {
		return Promise.resolve()
	},

	reset() {
		return Promise.resolve()
	},

	set() {
		return Promise.resolve()
	},

	ttl() {
		return Promise.resolve(0)
	},
}
