import {
	type AuthCredentials,
	type AuthProvider,
	Client,
} from "@s21toolkit/client"

export class TokenOnlyAuthProvider implements AuthProvider {
	#token: string

	constructor(token: string) {
		this.#token = token
	}

	async getAuthCredentials(): Promise<AuthCredentials> {
		return {
			accessToken: this.#token,
			schoolId: "",
		}
	}
}

export class TokenAuthProvider implements AuthProvider {
	#token: string
	#schoolId?: string

	constructor(token: string, schoolId?: string) {
		this.#token = token
		this.#schoolId = schoolId
	}

	async #fetchUserId() {
		const client = new Client(new TokenOnlyAuthProvider(this.#token))

		const userRoleData = await client.api.userRoleLoaderGetRoles()

		const schoolId = userRoleData.user.getCurrentUserSchoolRoles[0]?.schoolId

		if (!schoolId) {
			throw new Error("Unable to extract school id")
		}

		return schoolId
	}

	async getAuthCredentials(): Promise<AuthCredentials> {
		if (!this.#schoolId) {
			this.#schoolId = await this.#fetchUserId()
		}

		return {
			accessToken: this.#token,
			schoolId: this.#schoolId,
		}
	}
}
