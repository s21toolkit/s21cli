// Bun ProcessEnv shim
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string
		}
	}
}
