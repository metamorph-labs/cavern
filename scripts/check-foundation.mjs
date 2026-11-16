import { access, readFile, readdir } from "node:fs/promises";

const required = [
  "AGENTS.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "deny.toml",
  "LICENSE",
  "NOTICE",
  "README.md",
  "SECURITY.md",
  "package.json",
  "pnpm-workspace.yaml",
  "rust-toolchain.toml",
  "sdks/java/build.gradle.kts",
  "sdks/kotlin/build.gradle.kts",
  "sdks/dotnet/Metamorph.Cavern/Metamorph.Cavern.csproj",
  "sdks/swift/Package.swift",
  "sdks/php/composer.json",
  "sdks/dart/pubspec.yaml",
  "sdks/ruby/cavern.gemspec",
];

const handwrittenSourceExtensions = new Set([
  ".cs",
  ".dart",
  ".java",
  ".js",
  ".jsx",
  ".kt",
  ".kts",
  ".php",
  ".rb",
  ".rs",
  ".swift",
  ".ts",
  ".tsx",
]);
const generatedDirectoryNames = new Set([
  ".build",
  ".dart_tool",
  ".gradle",
  "bin",
  "build",
  "node_modules",
  "obj",
  "target",
  "vendor",
]);
const forbiddenCompatibilitySyntax = [
  ["Rust serde alias", /#\s*\[\s*serde\s*\([^\]]*\balias\s*=/u],
  ["Rust deprecation", /#\s*\[\s*deprecated(?:\s|=|\])/u],
  ["JSDoc or PHP deprecation", /@deprecated\b/u],
  ["Java, Kotlin or Dart deprecation", /@Deprecated\b/u],
  ["C# deprecation", /\[\s*Obsolete(?:Attribute)?\b/u],
  ["Swift deprecation", /@available\([^)]*\bdeprecated\b/u],
  ["Jackson compatibility alias", /\bJsonAlias\s*\(/u],
];

function extension(path) {
  const index = path.lastIndexOf(".");
  return index < 0 ? "" : path.slice(index);
}

async function rejectCompatibilitySyntax(root) {
  for (const relativePath of await readdir(root, { recursive: true })) {
    if (relativePath.split(/[/\\]/u).some((part) => generatedDirectoryNames.has(part))) continue;
    if (!handwrittenSourceExtensions.has(extension(relativePath))) continue;
    const path = `${root}/${relativePath}`;
    const source = await readFile(path, "utf8");
    for (const [label, pattern] of forbiddenCompatibilitySyntax) {
      if (pattern.test(source)) {
        throw new Error(`${path} contains forbidden pre-release ${label} syntax`);
      }
    }
  }
}

await Promise.all(required.map((path) => access(path)));
await Promise.all([
  rejectCompatibilitySyntax("clients"),
  rejectCompatibilitySyntax("conformance"),
  rejectCompatibilitySyntax("examples"),
  rejectCompatibilitySyntax("plugins"),
  rejectCompatibilitySyntax("sdks"),
  rejectCompatibilitySyntax("tools"),
]);

const packageManifest = JSON.parse(await readFile("package.json", "utf8"));
if (packageManifest.packageManager !== "pnpm@11.0.9") {
  throw new Error("package.json must pin pnpm 11.0.9");
}
if (packageManifest.engines?.node !== "24.19.0") {
  throw new Error("package.json must pin Node.js 24.19.0");
}
if (packageManifest.license !== "Apache-2.0") {
  throw new Error("the public workspace must use Apache-2.0");
}
if (
  packageManifest.scripts?.["check:advisories"] !==
    "cargo deny --manifest-path sdks/rust/Cargo.toml check advisories && pnpm audit --audit-level low" ||
  !packageManifest.scripts?.check?.includes("pnpm check:advisories")
) {
  throw new Error("pnpm check must fail closed on RustSec and npm advisories");
}
const denyPolicy = await readFile("deny.toml", "utf8");
if (
  denyPolicy !==
  '[graph]\nall-features = true\n\n[advisories]\nversion = 2\nyanked = "deny"\nunmaintained = "workspace"\nignore = []\n'
) {
  throw new Error("deny.toml must retain the reviewed all-feature advisory policy without waivers");
}

const toolchain = await readFile("rust-toolchain.toml", "utf8");
if (!toolchain.includes('channel = "1.98.1"')) {
  throw new Error("rust-toolchain.toml must pin Rust 1.98.1");
}

const readme = await readFile("README.md", "utf8");
if (!readme.includes("public developer repository")) {
  throw new Error("README.md must identify the public repository boundary");
}

console.log("Cavern public repository foundation is valid.");
