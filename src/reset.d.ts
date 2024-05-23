import "@total-typescript/ts-reset"

declare global {
	interface ArrayConstructor {
		isArray(arg: unknown): arg is unknown[] | readonly unknown[]
	}
}
