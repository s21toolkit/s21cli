import { CString } from "bun:ffi"

export namespace CStringUtils {
	const encoder = new TextEncoder()

	export function encode(value: string) {
		return encoder.encode(`${value}\0`)
	}

	export function decode(value: CString) {
		return value.toString()
	}
}
