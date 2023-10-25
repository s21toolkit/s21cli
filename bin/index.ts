#!/usr/bin/env bun

import { binary, runSafely } from "cmd-ts"
import { cli } from "@/cli"
import { CLIError } from "@/cli/CLIError"

async function main(): Promise<number> {
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
		if (error instanceof Error) {
			console.error(error.message)
		} else {
			console.error("Unknown error")
		}

		if (error instanceof CLIError) {
			return error.exitCode
		}

		return 1
	}
}

process.exit(await main())
