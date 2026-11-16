#!/usr/bin/env node

import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { CavernClient } from "@metamorph-labs/cavern-sdk";

import { createCavernMcpServer } from "./server.js";

const baseUrl = process.env.CAVERN_BASE_URL;
const credential = process.env.METAMORPH_TOKEN;

if (baseUrl === undefined || baseUrl.length === 0) {
  console.error(JSON.stringify({ code: "CAVERN_MCP_BASE_URL_REQUIRED" }));
  process.exitCode = 2;
} else if (credential === undefined || credential.length === 0) {
  console.error(JSON.stringify({ code: "CAVERN_MCP_TOKEN_REQUIRED" }));
  process.exitCode = 2;
} else {
  try {
    const client = new CavernClient({ baseUrl, credential });
    await serveStdio(() => createCavernMcpServer(client));
  } catch {
    console.error(JSON.stringify({ code: "CAVERN_MCP_RUNTIME_FAILED" }));
    process.exitCode = 1;
  }
}
