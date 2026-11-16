#!/usr/bin/env node

import { runCli } from "./cli.js";

process.exitCode = await runCli(process.argv.slice(2), {
  environment: {
    ...(process.env.CAVERN_BASE_URL === undefined
      ? {}
      : { CAVERN_BASE_URL: process.env.CAVERN_BASE_URL }),
    ...(process.env.METAMORPH_TOKEN === undefined
      ? {}
      : { METAMORPH_TOKEN: process.env.METAMORPH_TOKEN }),
    ...(process.env.CAVERN_CONTEXT === undefined
      ? {}
      : { CAVERN_CONTEXT: process.env.CAVERN_CONTEXT }),
    ...(process.env.CAVERN_CONTEXT_FILE === undefined
      ? {}
      : { CAVERN_CONTEXT_FILE: process.env.CAVERN_CONTEXT_FILE }),
  },
  io: { stdin: process.stdin, stderr: process.stderr, stdout: process.stdout },
});
