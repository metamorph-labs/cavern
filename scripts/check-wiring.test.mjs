import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { clientCalls, operationIds, validatePublicWiring } from "./check-wiring.mjs";

test("extracts only canonical contract operations and client calls", () => {
  assert.deepEqual(
    operationIds({ paths: { "/v1/example": { get: { operationId: "getExample" } } } }),
    ["getExample"],
  );
  assert.deepEqual([...clientCalls("client.getExample(); other.getIgnored();")], ["getExample"]);
});

test("the promoted public caller graph is completely wired", async () => {
  const inputs = await repositoryInputs();
  assert.deepEqual(validatePublicWiring(inputs), {
    managementOperations: 83,
    dataOperations: 7,
    workloadOperations: 10,
    externalAgentOperations: 70,
    publicLanguages: 11,
    plugins: 2,
  });
});

test("rejects a promoted operation missing from a language client", async () => {
  const inputs = await repositoryInputs();
  inputs.dataContract = structuredClone(inputs.dataContract);
  inputs.dataContract.paths["/v1/missing"] = { get: { operationId: "getMissing" } };
  assert.throws(
    () => validatePublicWiring(inputs),
    /TypeScript data SDK is missing getMissing/u,
  );
});

async function repositoryInputs() {
  const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
  const [
    managementContract,
    dataContract,
    typescriptManagement,
    typescriptData,
    pythonData,
    pythonServer,
    goData,
    goServer,
    rustData,
    rustServer,
    cli,
    mcp,
    mcpPackage,
    release,
    codexPlugin,
    claudePlugin,
    example,
    javaData,
    javaServer,
    javaTransfer,
    javaWebhook,
    javaWire,
    kotlin,
    dotnetData,
    dotnetServer,
    dotnetTransfer,
    dotnetWebhook,
    swiftData,
    swiftServer,
    swiftTransfer,
    php,
    dartData,
    dartServer,
    ruby,
  ] = await Promise.all([
    read("contracts/openapi.v1.json").then(JSON.parse),
    read("contracts/data-openapi.v1.json").then(JSON.parse),
    read("sdks/typescript/src/client.ts"),
    read("sdks/typescript/src/data-client.ts"),
    read("sdks/python/src/cavern/client.py"),
    read("sdks/python/src/cavern/server.py"),
    read("sdks/go/client.go"),
    read("sdks/go/server.go"),
    read("sdks/rust/src/client.rs"),
    read("sdks/rust/src/server.rs"),
    read("clients/cli/src/cli.ts"),
    read("clients/mcp/src/server.ts"),
    read("clients/mcp/package.json"),
    read("contracts/release.json").then(JSON.parse),
    read("plugins/codex/cavern/.mcp.json"),
    read("plugins/claude-code/cavern/.mcp.json"),
    read("examples/node-upload/src/upload.ts"),
    read("sdks/java/src/main/java/com/metamorph/cavern/CavernDataClient.java"),
    read("sdks/java/src/main/java/com/metamorph/cavern/CavernServerClient.java"),
    read("sdks/java/src/main/java/com/metamorph/cavern/DirectTransfer.java"),
    read("sdks/java/src/main/java/com/metamorph/cavern/WebhookVerifier.java"),
    read("sdks/java/src/main/java/com/metamorph/cavern/Wire.java"),
    read("sdks/kotlin/src/main/kotlin/com/metamorph/cavern/kotlin/Cavern.kt"),
    read("sdks/dotnet/Metamorph.Cavern/Cavern.cs"),
    read("sdks/dotnet/Metamorph.Cavern/CavernServerClient.cs"),
    read("sdks/dotnet/Metamorph.Cavern/DirectTransfer.cs"),
    read("sdks/dotnet/Metamorph.Cavern/WebhookVerifier.cs"),
    read("sdks/swift/Sources/Cavern/Cavern.swift"),
    read("sdks/swift/Sources/CavernServer/CavernServerClient.swift"),
    read("sdks/swift/Sources/Cavern/DirectTransfer.swift"),
    read("sdks/php/src/Cavern.php"),
    read("sdks/dart/lib/cavern.dart"),
    read("sdks/dart/lib/cavern_server.dart"),
    read("sdks/ruby/lib/cavern.rb"),
  ]);
  return {
    managementContract,
    dataContract,
    typescriptManagement,
    typescriptData,
    pythonData,
    pythonServer,
    goData,
    goServer,
    rustData,
    rustServer,
    cli,
    mcp,
    mcpPackage,
    release,
    plugins: [codexPlugin, claudePlugin],
    example,
    javaData: `${javaData}\n${javaTransfer}\n${javaWire}`,
    javaServer: `${javaServer}\n${javaWebhook}`,
    kotlinData: kotlin,
    kotlinServer: kotlin,
    dotnetData: `${dotnetData}\n${dotnetTransfer}`,
    dotnetServer: `${dotnetServer}\n${dotnetWebhook}`,
    swiftData: `${swiftData}\n${swiftTransfer}`,
    swiftServer,
    phpData: php,
    phpServer: php,
    dartData,
    dartServer,
    rubyData: ruby,
    rubyServer: ruby,
  };
}
