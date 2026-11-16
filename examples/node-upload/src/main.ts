import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import { CavernClient } from "@metamorph-labs/cavern-sdk";

import { uploadVerifyAndCleanupFile } from "./upload.js";

const [filePath, tenantId, projectId, environmentId, collectionInstanceId, refusalEnvironmentId, logicalPath] = process.argv.slice(2);
const baseUrl = process.env.CAVERN_BASE_URL;
const credential = process.env.METAMORPH_TOKEN;

if (
  filePath === undefined ||
  tenantId === undefined ||
  projectId === undefined ||
  environmentId === undefined ||
  collectionInstanceId === undefined ||
  refusalEnvironmentId === undefined ||
  baseUrl === undefined ||
  credential === undefined
) {
  console.error(
    "usage: node dist/main.js <file> <tenant-id> <project-id> <environment-id> <collection-id> <refusal-environment-id> [logical-path]",
  );
  process.exitCode = 2;
} else {
  try {
    const bytes = await readFile(filePath);
    const entry = await uploadVerifyAndCleanupFile({
      client: new CavernClient({ baseUrl, credential }),
      tenantId,
      projectId,
      environmentId,
      collectionInstanceId,
      refusalEnvironmentId,
      allowDevelopmentLoopbackHttp:
        process.env.CAVERN_DEVELOPMENT_ALLOW_LOOPBACK_UPLOAD_URLS === "1",
      bytes,
      path: logicalPath ?? basename(filePath),
      mediaType: "application/octet-stream",
    });
    process.stdout.write(`${JSON.stringify(entry)}\n`);
  } catch {
    console.error(JSON.stringify({ code: "CAVERN_EXAMPLE_UPLOAD_FAILED" }));
    process.exitCode = 1;
  }
}
