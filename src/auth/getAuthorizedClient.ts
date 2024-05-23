import type { CachingBehavior } from "@/cache"
import { CachedClient, CachedUserAuthProvider } from "@/cache"
import { dataCache } from "@/cache/cache"
import { Configuration } from "@/configuration"
import { TokenAuthProvider } from "@s21toolkit/client"

export function getAuthorizedClient(
	cachingBehavior: CachingBehavior = "passthrough",
) {
	const { token } = Configuration.optional

	if (token) {
		const auth = new TokenAuthProvider(token)

		return new CachedClient(auth, dataCache, {
			cacheId: `default:${token}`,
			defaultCachingBehavior: cachingBehavior,
		})
	}

	const { username, password } = Configuration.required

	const auth = new CachedUserAuthProvider(username, password)

	const client = new CachedClient(auth, dataCache, {
		cacheId: `default:${btoa(`${username}:${password}`)}`,
		defaultCachingBehavior: cachingBehavior,
	})

	return client
}
