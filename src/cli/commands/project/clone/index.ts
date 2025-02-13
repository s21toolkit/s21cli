import assert from "node:assert"
import { execSync } from "node:child_process"
import {
	constants,
	accessSync,
	appendFileSync,
	existsSync,
	unlinkSync,
	writeFileSync,
} from "node:fs"
import { getStudentCurrentTaskGoalPairsWithStatus } from "@/adapters/getStudentCurrentTaskGoalPairsWithStatus"
import { getAuthorizedClient } from "@/auth"
import { DisplayedGoalStatus } from "@s21toolkit/client-schema"
import { command, flag } from "cmd-ts"

function gitcmd(command: string) {
	execSync(command, { stdio: "ignore" })
}

export const cloneCommand = command({
	name: "clone",
	description: "Clone last avaliable task from gitlab.",
	args: {
		wakatime: flag({
			long: "wakatime",
			defaultValue: () => false,
		}),
	},
	async handler({ wakatime }) {
		const taskGoalPairs = await getStudentCurrentTaskGoalPairsWithStatus(
			DisplayedGoalStatus.InProgress,
		)
		const lastTaskGoalPair = taskGoalPairs.pop()
		assert(lastTaskGoalPair, "No last task goals")
		const lastTaskGoalId = lastTaskGoalPair.goal.goalId
		assert(lastTaskGoalId, "No last task goalId")

		const api = getAuthorizedClient().api("cache")
		const answerId = lastTaskGoalPair.currentTask.lastAnswer?.id
		assert(answerId, "No last answer id")

		const gitlabInfo = await api.getProjectGitlabInfo({ answerId })
		const sshLink =
			gitlabInfo.student?.getPrivateGitlabProjectLinkInfoByAnswerId.sshLink
		assert(sshLink, "No sshLink")

		const folderName = sshLink.split("/").pop()?.replace(".git", "")
		assert(folderName, "Failed to parse git url")

		if (!existsSync(folderName)) {
			gitcmd(`git clone ${sshLink}`)
		}

		process.chdir(`${folderName}/src`)
		try {
			gitcmd("git switch develop")
		} catch {
			gitcmd("git switch -c develop")
		}

		try {
			accessSync(".gitkeep", constants.O_WRONLY)
			unlinkSync(".gitkeep")
			gitcmd("git add .gitkeep")
			gitcmd("git commit -m 'chore(s21toolkit): delete .gitkeep'")
		} catch {
			console.error("❌ Can't delete .gitkeep file")
		}

		if (wakatime) {
			appendFileSync("../.git/info/exclude", ".wakatime-project")
			writeFileSync(".wakatime-project", folderName)
		}

		console.log(folderName)
	},
})
