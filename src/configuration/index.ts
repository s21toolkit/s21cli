import { type } from "arktype"
import { ConfigurationManager } from "./ConfigurationManager"

export const Configuration = new ConfigurationManager({
	prDirectory: type("string"),
	username: type("string"),
	password: type("string"),
})

await Configuration.loadAll()
