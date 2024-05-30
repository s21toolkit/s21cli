import { stdout } from "node:process"
import { inspect } from "node:util"

function inspectValue(value: unknown) {
	const inspected = inspect(value, {
		depth: Number.POSITIVE_INFINITY,
		colors: stdout.isTTY,
		compact: false,
	})

	return inspected
}

function formatValue(value: unknown) {
	if (typeof value === "string") {
		return value
	}

	return inspectValue(value)
}

export function formatLogMessage(message: unknown) {
	if (!Array.isArray(message)) {
		return formatValue(message)
	}

	const result = []

	for (const item of message) {
		result.push(formatValue(item))
	}

	return result.join(" ")
}
