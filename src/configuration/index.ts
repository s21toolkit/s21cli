import { arrayOf, type } from "arktype"
import { ConfigurationManager } from "./ConfigurationManager"
import { ConfigurationSource } from "./ConfigurationSchema"

export const Configuration = new ConfigurationManager({
	// Authentication
	username: type("string"),
	password: type("string"),
	token: type("string"),
	schoolId: type("string"),

	// Debug
	debugRawErrors: type([
		"boolean",
		"|",
		["string", "|>", (value) => value === "true"],
	]),

	// pr/clone
	prDirectory: type("string"),

	// Scripts
	scripts: [
		arrayOf({
			name: "string",
			path: "string",
		}),
		ConfigurationSource.File,
	],
})

await Configuration.load()
