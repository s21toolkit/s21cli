import type { Store } from "cache-manager"
// @ts-expect-error
import { DiskStore as _DiskStore } from "cache-manager-fs-hash"

export type DiskStoreConfig = {
	/**
	 * Path for cached files
	 */
	path?: string

	/**
	 * Time to life in seconds
	 */
	ttl?: number

	/**
	 * Zip content to save disk space
	 */
	zip?: boolean

	/**
	 * Create subdirectories
	 */
	subdirs?: boolean
}

type DiskStore = Store

export function createDiskStore(config: DiskStoreConfig): DiskStore {
	return new _DiskStore(config)
}
