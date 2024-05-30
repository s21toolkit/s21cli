import { Config, Effect, Layer, LogLevel, Logger } from "effect"

const DEFAULT_LOG_LEVEL = LogLevel.Error

const LogLevelLive = Config.logLevel("S21_LOG_LEVEL").pipe(
	Config.withDefault(DEFAULT_LOG_LEVEL),
	Effect.andThen((logLevel) => Logger.minimumLogLevel(logLevel)),
	Layer.unwrapEffect,
)

export const LoggerLive = Logger.replace(
	Logger.defaultLogger,
	Logger.make((options) => {
		Logger.defaultLogger.log(options)
	}),
).pipe(Layer.provide(LogLevelLive))
