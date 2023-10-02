import env from "env-var"

// Bun ProcessEnv shim
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string
		}
	}
}

export namespace Environment {
	// prettier-ignore
	export const USERNAME = env
		.get("S21_USERNAME")
		.required()
		.asString()

	// prettier-ignore
	export const PASSWORD = env
		.get("S21_PASSWORD")
		.required()
		.asString()

	// prettier-ignore
	export const PR_DIRECTORY = env
		.get("S21_PR_DIRECTORY")
		.required()
		.asString()
}
