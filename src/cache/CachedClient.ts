import type { AuthProvider } from "@s21toolkit/client"
import { ApiContext, Client } from "@s21toolkit/client"
import type { Cache } from "cache-manager"
import { randomUUID } from "node:crypto"

class CachedApiContext extends ApiContext {
	override client: CachedClient

	constructor(client: CachedClient) {
		super(client)
		this.client = client
	}
}

export class CachedClient extends Client {
	constructor(
		authProvider: AuthProvider,
		readonly cache: Cache,
		readonly cacheId: string = randomUUID(),
	) {
		super(authProvider)
	}

	#createOperationCacheKey(
		operationName: string,
		variables: Record<string, unknown>,
	) {
		const encodedVariables = btoa(JSON.stringify(variables))

		return `@CachedClient/${this.cacheId}/request/${operationName}:${encodedVariables}`
	}

	override get api() {
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
					apply(method, thisArg, argArray) {
						const [variables] = argArray

						const cacheKey = context.client.#createOperationCacheKey(
							p,
							variables,
						)

						const call = async () => {
							const cachedResult =
								await context.client.cache.get(cacheKey)

							if (!cachedResult) {
								const result = await Reflect.apply(
									method,
									thisArg,
									argArray,
								)

								await context.client.cache.set(cacheKey, result)

								return result
							}

							return cachedResult
						}

						return call()
					},
				})
			},
		})
	}
}
