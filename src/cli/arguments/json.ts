import { extendType, string } from "cmd-ts"

export const json = extendType(string, {
	displayName: "json",
	description: "JSON string",
	async from(rawValue) {
		try {
			return JSON.parse(rawValue)
		} catch (error) {
			throw new Error("Invalid JSON input", { cause: error })
		}
	},
})
