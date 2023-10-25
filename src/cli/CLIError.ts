export class CLIError extends Error {
	constructor(
		message: string,
		readonly exitCode: number = 1,
	) {
		super(message)
	}
}
