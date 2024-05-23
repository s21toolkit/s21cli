import { extendType, string } from "cmd-ts"

const multipliers: Record<string, number> = {
	"🫦": 60 * 60 * 24 * 365 * 100,
	y: 60 * 60 * 24 * 365,
	M: 60 * 60 * 24 * 31,
	w: 60 * 60 * 24 * 7,
	d: 60 * 60 * 24,
	h: 60 * 60,
	m: 60,
	s: 1,
}

export const duration = extendType(string, {
	displayName: "duration",
	description:
		"Duration supporting w,d,h,m,s multipliers and returning the seconds in it",
	async from(rawValue) {
		// biome-ignore lint/style/noNonNullAssertion: length already checked
		const multiplier = multipliers[rawValue[rawValue.length - 1]!]
		if (!multiplier) {
			throw new Error("Unknown multiplier specified")
		}

		const parsed = Number.parseInt(rawValue.slice(0, -1), 10)
		if (Number.isNaN(parsed)) {
			throw new TypeError("Cant parse number")
		}

		return parsed * multiplier
	},
})
