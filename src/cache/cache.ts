import { caching } from "cache-manager"
import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { Configuration } from "@/configuration"
import { Paths } from "@/paths"
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

const CACHE_BASENAME = "cache"

export const globalCacheDirectory = resolve(
	Paths.HOME,
	Paths.S21,
	CACHE_BASENAME,
)
export const localCacheDirectory = resolve(process.cwd(), CACHE_BASENAME)

export const cacheDirectory = cacheOptions.local
	? localCacheDirectory
	: globalCacheDirectory

await mkdir(cacheDirectory, {
	recursive: true,
})

const authStore = createDiskStore({
	ttl: AUTH_TTL_SEX,
	path: resolve(cacheDirectory, "auth"),
	subdirs: !cacheOptions.flat,
	zip: cacheOptions.zip,
})

const dataStore = createDiskStore({
	ttl: PERSISTENT_TTL_SEX,
	path: resolve(cacheDirectory, "data"),
	subdirs: !cacheOptions.flat,
	zip: cacheOptions.zip,
})

export const authCache = await caching(
	cacheOptions.enabled ? authStore : NoopStore,
)

export const dataCache = await caching(
	cacheOptions.enabled ? dataStore : NoopStore,
)
