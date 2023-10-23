import { Console, Effect, pipe } from "effect"
import type { LazyArg } from "effect/Function"
import { Configuration } from "@/configuration"

export function commandHandler(handlerFunction: LazyArg<void | Promise<void>>) {
	return pipe(
		async () => await handlerFunction(),
		Effect.tryPromise,
		Effect.catchIf(
			() => {
				const errorHandlingDisabled =
					Configuration.optional.debugDisableErrorHandling ?? false

				return !errorHandlingDisabled
			},
			(error) =>
				Effect.gen(function* (_) {
					yield* _(Console.error("Fatal error!"))

					if (!(error instanceof Error)) {
						yield* _(Console.error("Unknown error"))

						return
					}

					yield* _(Console.error(error.message))
				}),
		),
		Effect.runPromise,
	)
}
