import { resolve } from "path"
import { command, positional } from "cmd-ts"
import { Configuration } from "@/configuration"
import { getDefaultClient } from "@/tools/getDefaultClient"

export const executeCommand = command({
	name: "execute",
	description: "Executes user script",
	aliases: ["exec", "x"],
	args: {
		name: positional({
			displayName: "name",
		}),
	},
	async handler(argv) {
		const scripts = Configuration.optional.scripts ?? []

		const script = scripts.filter((script) => script.name === argv.name)[0]

		if (!script) {
			throw new Error(`Unable to find script "${argv.name}"`)
		}

		const scriptModule = (await import(
			resolve(process.cwd(), script.path)
		)) as unknown

		if (
			!scriptModule ||
			typeof scriptModule !== "object" ||
			!("main" in scriptModule)
		) {
			return
		}

		if (typeof scriptModule.main !== "function") {
			throw new TypeError(
				`Invariant violation: ["${script.name}"].main must be a function`,
			)
		}

		await scriptModule.main({
			meta: script,
			configuration: Configuration,
			client: getDefaultClient(),
		})
	},
})
