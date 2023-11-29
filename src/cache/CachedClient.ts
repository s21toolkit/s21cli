import type { AuthProvider } from "@s21toolkit/client"
import { ApiContext, Client } from "@s21toolkit/client"
import { type Cache } from "cache-manager"
import { randomUUID } from "node:crypto"

class CachedApiContext extends ApiContext {
	constructor(override client: CachedClient) {
		super(client)
	}
}

export type CachingBehavior = "cache" | "invalidate" | "passthrough"

export type CachedClientConfig = {
	defaultCachingBehavior: CachingBehavior
	cacheId: string
	ttl?: number
}

function createCachedClientConfig(
	partialConfig: Partial<CachedClientConfig>,
): CachedClientConfig {
	return {
		cacheId: partialConfig.cacheId ?? randomUUID(),
		defaultCachingBehavior: partialConfig.defaultCachingBehavior ?? "cache",
		ttl: partialConfig.ttl,
	}
}

type CachedApiContextProxy = CachedApiContext & {
	(cachingBehavior: CachingBehavior, ttl?: number): CachedApiContext
}

/**
 * Unholy proxy cringe
 */
export class CachedClient extends Client {
	#config: CachedClientConfig

	constructor(
		authProvider: AuthProvider,
		readonly cache: Cache,
		config: Partial<CachedClientConfig>,
	) {
		super(authProvider)

		this.#config = createCachedClientConfig(config)
	}

	#createOperationCacheKey(
		operationName: string,
		variables: Record<string, unknown>,
	) {
		const encodedVariables = btoa(JSON.stringify(variables))

		return `@CachedClient/${this.#config.cacheId}/request/${operationName}:${encodedVariables}`
	}

	override get api() {
		const defaultCachedContext = this.#createCachedApiContext(
			this.#config.defaultCachingBehavior,
			this.#config.ttl,
		)

		const applyProxyTarget = Object.assign(() => {}, { client: this })

		const applyProxy = new Proxy(applyProxyTarget, {
			apply(target, _thisArg, argArray) {
				const [cachingBehavior, ttl] = argArray

				return target.client.#createCachedApiContext(cachingBehavior, ttl)
			},

			get(_target, p: keyof typeof defaultCachedContext, _receiver) {
				return defaultCachedContext[p]
			},
		})

		return applyProxy as unknown as CachedApiContextProxy
	}

	#createCachedApiContext(cachingBehavior: CachingBehavior, ttl?: number) {
		return new Proxy(new CachedApiContext(this), {
			get(context, p, receiver) {
				const value: ApiContext[keyof ApiContext] = Reflect.get(
					context,
					p,
					receiver,
				)

				if (typeof value !== "function" || typeof p != "string") {
					return value
				}

				return new Proxy(value, {
					async apply(method, thisArg, argArray) {
						if (cachingBehavior === "passthrough") {
							return await Reflect.apply(method, thisArg, argArray)
						}

						const [variables] = argArray

						const cacheKey = context.client.#createOperationCacheKey(
							p,
							variables,
						)

						if (cachingBehavior === "invalidate") {
							context.client.cache.del(cacheKey)
						}

						return await context.client.cache.wrap(
							cacheKey,
							async () => await Reflect.apply(method, thisArg, argArray),
							ttl,
						)
					},
				})
			},
		})
	}
}
