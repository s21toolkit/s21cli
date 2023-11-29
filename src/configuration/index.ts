import { type } from "arktype"
import { ConfigurationManager } from "./ConfigurationManager"

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

	// Cache
	cache: type({
		"enabled?": "boolean",
		"zip?": "boolean",
		"local?": "boolean",
		"flat?": "boolean",
	}),

	// pr/clone
	prDirectory: type("string"),
})

await Configuration.load()
