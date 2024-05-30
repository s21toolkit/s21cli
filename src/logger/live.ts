import { stdout } from "node:process"
import { Config, Effect, Layer, LogLevel, Logger } from "effect"
import { JsonLogger, PrettyLogger } from "effect-log"
import { formatLogMessage } from "./format"

const DEFAULT_LOG_LEVEL = LogLevel.Error

const LogLevelLive = Config.logLevel("S21_LOG_LEVEL").pipe(
	Config.withDefault(DEFAULT_LOG_LEVEL),
	Effect.andThen((logLevel) => Logger.minimumLogLevel(logLevel)),
	Layer.unwrapEffect,
)

export const LoggerLive = Layer.unwrapEffect(
	Effect.gen(function* (_) {
		const logFormat = yield* Config.literal(
			"pretty",
			"json",
		)("S21_LOG_FORMAT").pipe(Config.withDefault("pretty"))

		switch (logFormat) {
			case "pretty":
				return PrettyLogger.make({
					showFiberId: false,
					showSpans: true,
					showTime: false,
					enableColors: stdout.isTTY,
				}).pipe(Logger.mapInput(formatLogMessage))
			case "json":
				return JsonLogger.make({})
		}
	}).pipe(
		Effect.map((logger) => Logger.replace(Logger.defaultLogger, logger)),
	),
).pipe(Layer.provide(LogLevelLive))
