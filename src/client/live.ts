import { Effect, Layer } from "effect"
import { Client } from "./service"

import { Configuration } from "@/configuration"
import {
	Client as S21Client,
	TokenAuthProvider,
	UserAuthProvider,
} from "@s21toolkit/client"
import { Schema as S21Schema } from "@s21toolkit/client-schema"

export const ClientLive = Layer.effect(
	Client,
	Effect.gen(function* (_) {
		const configuration = yield* Configuration

		let auth

		if ("token" in configuration.general.credentials) {
			auth = new TokenAuthProvider(configuration.general.credentials.token)
		} else {
			auth = new UserAuthProvider(
				configuration.general.credentials.username,
				configuration.general.credentials.password,
			)
		}

		const client = new S21Client(S21Schema, auth)

		return client
	}),
)
