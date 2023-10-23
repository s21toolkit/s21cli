import { type } from "arktype"
import { ConfigurationManager } from "./ConfigurationManager"

export const Configuration = new ConfigurationManager({
	// Authentication
	username: type("string"),
	password: type("string"),

	// Debug
	debugDisableErrorHandling: type([
		"boolean",
		"|",
		["string", "|>", (value) => value === "true"],
	]),

	// pr/clone
	prDirectory: type("string"),
})

await Configuration.load()
