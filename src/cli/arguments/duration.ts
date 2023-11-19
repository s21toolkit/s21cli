import { extendType, string } from "cmd-ts"

const multiplyers: Record<string, number> = {
    "y": 60 * 60 * 24 * 365,
    "M": 60 * 60 * 24 * 31,
    "w": 60 * 60 * 24 * 7,
    "d": 60 * 60 * 24,
    "h": 60 * 60,
    "m": 60,
    "s": 1,
}

export const duration = extendType(string, {
	displayName: "duration",
	description: "Duration in supporting w,d,h,m,s multiplyers and returning the seconds in it",
	async from(rawValue) {
        let multiplyer = multiplyers[rawValue[rawValue.length - 1]!];
        if(!multiplyer) {
            throw new Error("Unknow multiplyer specified")
        }

        const parsed = parseInt(rawValue.slice(0, rawValue.length - 1), 10)
        if(parsed != parsed) {
            throw new Error("Cant parse number")
        }

        return parsed * multiplyer
	},
})