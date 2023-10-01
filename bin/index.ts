#!/usr/bin/env bun

import { binary, run } from "cmd-ts"
import { cli } from "@/cli"

run(binary(cli), process.argv)
