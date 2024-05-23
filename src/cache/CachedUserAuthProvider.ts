import {
	type ContextHeaders,
	UserAuthProvider,
	isExpired,
} from "@s21toolkit/client"
import { authCache } from "./cache"

export class CachedUserAuthProvider extends UserAuthProvider {
	#accessTokenCacheKey
	#contextHeadersCacheKey

	constructor(username: string, password: string) {
		super(username, password)

		this.#accessTokenCacheKey = btoa(`${username}:${password}:accessToken`)
		this.#contextHeadersCacheKey = btoa(
			`${username}:${password}:contextHeaders`,
		)
	}

	override async getAccessToken(): Promise<string> {
		const cachedAccessToken = await authCache.get<string>(
			this.#accessTokenCacheKey,
		)

		if (!cachedAccessToken) {
			const accessToken = await super.getAccessToken()

			await authCache.set(this.#accessTokenCacheKey, accessToken)

			return accessToken
		}

		if (isExpired(cachedAccessToken)) {
			await authCache.del(this.#accessTokenCacheKey)

			return await this.getAccessToken()
		}

		return cachedAccessToken
	}

	override async getContextHeaders(): Promise<ContextHeaders> {
		const cachedContextHeaders = await authCache.get<ContextHeaders>(
			this.#contextHeadersCacheKey,
		)

		if (!cachedContextHeaders) {
			const contextHeaders = await super.getContextHeaders()

			await authCache.set(this.#contextHeadersCacheKey, contextHeaders)

			return contextHeaders
		}

		return cachedContextHeaders
	}
}
