import {
	type AuthCredentials,
	isExpired,
	UserAuthProvider,
} from "@s21toolkit/client"
import { authCache } from "./cache"

export class CachedUserAuthProvider extends UserAuthProvider {
	#username: string
	#password: string

	constructor(username: string, password: string) {
		super(username, password)

		this.#username = username
		this.#password = password
	}

	override async getAuthCredentials(): Promise<AuthCredentials> {
		const key = btoa(`${this.#username}:${this.#password}`)

		const cachedCredentials = await authCache.get<AuthCredentials>(key)

		if (!cachedCredentials) {
			const credentials = await super.getAuthCredentials()

			await authCache.set(key, credentials)

			return credentials
		}

		if (isExpired(cachedCredentials.accessToken)) {
			await authCache.del(key)

			return await this.getAuthCredentials()
		}

		return cachedCredentials
	}
}
