#!/usr/bin/env node

import "disposablestack/auto"
import process from "node:process"
import { cli } from "@/cli"
import { CLIError } from "@/cli/CLIError"
import { Configuration } from "@/configuration"
import { binary, runSafely } from "cmd-ts"

async function main(): Promise<number> {
	const displayRawErrors = Configuration.optional.debugRawErrors ?? false

	try {
		const result = await runSafely(binary(cli), process.argv)

		if (result._tag === "error") {
			const { config } = result.error

			const log = config.into === "stderr" ? console.error : console.log

			log(config.message)

			return config.exitCode
		}

		return 0
	} catch (error) {
		console.error("Fatal error!")

		if (error instanceof Error) {
			console.error(error.message)
		} else {
			console.error("Unknown error")
		}

		if (displayRawErrors) {
			console.error(error)
		}

		if (error instanceof CLIError) {
			return error.exitCode
		}

		return 1
	}
}

process.exit(await main())
