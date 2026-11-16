import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const examples = [
  ["spring-boot", "src/main/java/example/CavernApplication.java", ["org.springframework.boot", "X-App-User", "CavernDataClient", "getFileMetadataWithCapability"]],
  ["ktor", "src/main/kotlin/example/Application.kt", ["io.ktor", "X-App-User", "CavernDataClient", "getFileMetadataWithCapability"]],
  ["aspnet", "Program.cs", ["WebApplication", "X-App-User", "CavernDataClient", "GetFileMetadataWithCapability"]],
  ["fastapi", "python-web/fastapi_app.py", ["FastAPI", "x_app_user", "CavernDataClient", "get_file_metadata_with_capability"]],
  ["django", "python-web/django_app/views.py", ["JsonResponse", "X-App-User", "CavernDataClient", "get_file_metadata_with_capability"]],
  ["laravel", "public/index.php", ["Illuminate\\Routing\\Router", "X-App-User", "CavernDataClient", "getFileMetadataWithCapability"]],
  ["rails", "app.rb", ["Rails::Application", "X-App-User", "Cavern::DataClient", "get_file_metadata_with_capability"]],
  ["swiftui", "Sources/CavernSwiftUIExample/App.swift", ["SwiftUI", "CAVERN_CAPABILITY", "CavernDataClient", "getFileMetadataWithCapability"]],
  ["flutter", "lib/main.dart", ["package:flutter", "CAVERN_CAPABILITY", "CavernDataClient", "getFileMetadataWithCapability"]],
];

for (const [name, relative, needles] of examples) {
  const directory = ["fastapi", "django"].includes(name) ? "python-web" : name;
  const path = resolve(root, "examples", "frameworks", directory, relative.replace(/^python-web\//u, ""));
  const value = await readFile(path, "utf8");
  for (const needle of needles) {
    if (!value.includes(needle)) throw new Error(`${name} example is missing ${needle}`);
  }
  if (!value.includes("CAVERN_CAPABILITY")) throw new Error(`${name} example does not source bounded capability authority`);
  if (/mm_(?:pat|sak)_v1|METAMORPH_TOKEN/u.test(value)) throw new Error(`${name} example contains management credential material`);
  if (/\bCavernClient\b/u.test(value)) throw new Error(`${name} example imports the management client`);
}

const common = JSON.parse(await readFile(resolve(root, "conformance", "application-sdk.v1.json"), "utf8"));
if (common.schema_id !== "cavern.public.application-sdk-conformance.v1" || common.format_version !== 1) {
  throw new Error("application SDK conformance vector identity drifted");
}
if (common.managed_development.cleanup.applicable !== false || common.managed_development.cleanup.reason !== "read_only_journey") {
  throw new Error("managed-development read journey must not invent cleanup authority");
}
if (common.behavior_receipt.signed.algorithm !== "ed25519" || common.behavior_receipt.key_set.format_version !== 1) {
  throw new Error("behavior receipt vector is not the bounded Ed25519 V1 shape");
}
