import { caching, memoryStore as createMemoryStore } from "cache-manager"
import { mkdir } from "node:fs/promises"
import { homedir } from "node:os"
import { resolve } from "node:path"
import { Configuration } from "@/configuration"
import { createDiskStore } from "./DiskStore"
import { NoopStore } from "./NoopStore"

const DEFAULT_CACHE_OPTIONS = {
	enabled: true,
	zip: false,
	local: false,
	flat: false,
}

const { cache: cacheConfiguration } = Configuration.optional

const cacheOptions = {
	...DEFAULT_CACHE_OPTIONS,
	...(cacheConfiguration ?? {}),
}

const AUTH_TTL_SEX = 60 * 60 * 10 // 10h
const PERSISTENT_TTL_SEX = 60 * 60 * 48 // 48h

const MEMORY_TTL_MS = 1000 * 60 * 5 // 5m

const cacheDirBase = cacheOptions.local ? process.cwd() : homedir()

const cacheDir = resolve(cacheDirBase, ".s21/cache")

await mkdir(cacheDir, {
	recursive: true,
})

const authStore = createDiskStore({
	ttl: AUTH_TTL_SEX,
	path: resolve(cacheDir, "auth"),
	subdirs: !cacheOptions.flat,
	zip: cacheOptions.zip,
})

const persistentStore = createDiskStore({
	ttl: PERSISTENT_TTL_SEX,
	path: resolve(cacheDir, "data"),
	subdirs: !cacheOptions.flat,
	zip: cacheOptions.zip,
})

const memoryStore = createMemoryStore({
	ttl: MEMORY_TTL_MS,
})

export const authCache = await caching(
	cacheOptions.enabled ? authStore : NoopStore,
)

export const persistentCache = await caching(
	cacheOptions.enabled ? persistentStore : NoopStore,
)

export const memoryCache = await caching(
	cacheOptions.enabled ? memoryStore : NoopStore,
)
