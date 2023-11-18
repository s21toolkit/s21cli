declare const EXTERNAL_APP_VERSION: string | undefined

export const APP_VERSION =
	typeof EXTERNAL_APP_VERSION !== "undefined" ? EXTERNAL_APP_VERSION : "dev"
