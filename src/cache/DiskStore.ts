import type { Store } from "cache-manager"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { create as _createDiskStore } from "cache-manager-fs-hash"

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
	 * Max size in bytes on disk
	 */
	maxsize?: number

	/**
	 * Create subdirectories
	 */
	subdirs?: boolean
}

type DiskStore = Store

export function createDiskStore(config: DiskStoreConfig): DiskStore {
	return _createDiskStore(config)
}
