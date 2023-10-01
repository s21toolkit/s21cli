import { symbols } from "./symbols"
import { CStringUtils } from "./utils"

export class Client {
	#handle: bigint

	constructor(username: string, password: string) {
		const handle = symbols.ClientCreate(
			CStringUtils.encode(username),
			CStringUtils.encode(password),
		)

		this.#handle = handle
	}

	[Symbol.dispose]() {
		symbols.ClientDestroy(this.#handle)
	}

	destroy() {
		this[Symbol.dispose]()
	}

	testCredentials() {
		return symbols.ClientTestCredentials(this.#handle)
	}

	static testCredentials(username: string, password: string) {
		return symbols.TestCredentials(
			CStringUtils.encode(username),
			CStringUtils.encode(password),
		)
	}

	static use<TClient extends Client>(
		client: TClient,
		thunk: (client: TClient & {}) => void,
	) {
		thunk(client)

		client.destroy()
	}
}
