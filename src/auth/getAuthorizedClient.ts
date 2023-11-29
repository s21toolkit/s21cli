import { TokenAuthProvider } from "@s21toolkit/client"
import type { CachingBehavior } from "@/cache"
import { CachedClient, CachedUserAuthProvider } from "@/cache"
import { persistentCache } from "@/cache/cache"
import { Configuration } from "@/configuration"

export function getAuthorizedClient(
	cachingBehavior: CachingBehavior = "passthrough",
) {
	const { token, schoolId } = Configuration.optional

	if (token) {
		const auth = new TokenAuthProvider(token, { schoolId })

		return new CachedClient(auth, persistentCache, {
			cacheId: "default",
			defaultCachingBehavior: cachingBehavior,
		})
	}

	const { username, password } = Configuration.required

	const auth = new CachedUserAuthProvider(username, password)

	const client = new CachedClient(auth, persistentCache, {
		cacheId: "default",
		defaultCachingBehavior: cachingBehavior,
	})

	return client
}
