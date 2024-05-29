import { Context } from "effect"

export class Paths extends Context.Tag("Paths")<
	Paths,
	{
		readonly home: string

		readonly global: {
			readonly storage: string
			readonly cache: string
			readonly config: string
		}

		readonly local: {
			readonly storage: string
			readonly cache: string
			readonly config: string
		}
	}
>() {}
