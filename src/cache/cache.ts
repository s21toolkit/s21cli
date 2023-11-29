import { caching } from "cache-manager"
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

const cacheDirBase = cacheOptions.local ? process.cwd() : homedir()

export const cacheDirectory = resolve(cacheDirBase, ".s21/cache")

await mkdir(cacheDirectory, {
	recursive: true,
})

const authStore = createDiskStore({
	ttl: AUTH_TTL_SEX,
	path: resolve(cacheDirectory, "auth"),
	subdirs: !cacheOptions.flat,
	zip: cacheOptions.zip,
})

const persistentStore = createDiskStore({
	ttl: PERSISTENT_TTL_SEX,
	path: resolve(cacheDirectory, "data"),
	subdirs: !cacheOptions.flat,
	zip: cacheOptions.zip,
})

export const authCache = await caching(
	cacheOptions.enabled ? authStore : NoopStore,
)

export const persistentCache = await caching(
	cacheOptions.enabled ? persistentStore : NoopStore,
)
