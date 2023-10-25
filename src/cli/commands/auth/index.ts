import { fetchUserData, Token } from "@s21toolkit/client"
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

		const token = new Token(username, password)

		await token.refresh()

		console.log(`Token: ${token.accessToken}`)

		if (noId) {
			return
		}

		const user = await fetchUserData(token)

		console.log(
			`SchoolID: ${user.user.getCurrentUserSchoolRoles[0].schoolId}`,
		)
	},
})
