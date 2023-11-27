import { fetchAccessToken, fetchUserData } from "@s21toolkit/client"
import { command, flag } from "cmd-ts"
import { Configuration } from "@/configuration"

export const authCommand = command({
	name: "auth",
	description: "Performs user authentication, returns API token and school ID",
	args: {
		noId: flag({
			long: "no-id",
			description: "Not request school ID",
			defaultValue: () => false,
		}),
	},
	async handler(argv) {
		const { noId } = argv

		const { username, password } = Configuration.required

		const tokenResponse = await fetchAccessToken(username, password)

		console.log(`Token: ${tokenResponse.accessToken}`)

		if (noId) {
			return
		}

		const { user } = await fetchUserData(tokenResponse)

		const schoolId = user.getCurrentUserSchoolRoles[0]?.schoolId

		if (!schoolId) {
			throw new Error("Failed to extract schoolId")
		}

		console.log(`SchoolID: ${schoolId}`)
	},
})
