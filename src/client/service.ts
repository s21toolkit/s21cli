import type { Client as S21Client } from "@s21toolkit/client"
import type { Schema as S21Schema } from "@s21toolkit/client-schema"
import { Context } from "effect"

export class Client extends Context.Tag("Client")<
	Client,
	S21Client<S21Schema>
>() {}
