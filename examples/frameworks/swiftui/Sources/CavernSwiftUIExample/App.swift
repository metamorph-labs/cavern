import Cavern
import SwiftUI

@main
struct CavernSwiftUIExample: App {
    var body: some Scene { WindowGroup { FileView() } }
}

struct FileView: View {
    @State private var state = "Loading…"

    var body: some View {
        VStack(spacing: 12) {
            Text("Cavern managed-development read").font(.headline)
            Text(state).textSelection(.enabled)
            Button("Refresh") { Task { await load() } }
        }
        .padding(24)
        .task { await load() }
    }

    @MainActor
    private func load() async {
        do {
            let client = try CavernDataClient(
                baseURL: required("CAVERN_BASE_URL"),
                capability: { required("CAVERN_CAPABILITY") },
                retry: RetryPolicy(maxAttempts: 3, baseDelay: .milliseconds(100), maximumDelay: .seconds(2))
            )
            let value = try await client.getFileMetadataWithCapability(FileReference(
                tenantId: required("CAVERN_TENANT_ID"), projectId: required("CAVERN_PROJECT_ID"),
                environmentId: required("CAVERN_ENVIRONMENT_ID"), collectionInstanceId: required("CAVERN_COLLECTION_ID"),
                entryId: required("CAVERN_ENTRY_ID")
            ))
            guard case let .object(entry) = value,
                  case let .string(path)? = entry["logical_path"],
                  case let .string(lifecycle)? = entry["lifecycle"] else { throw CavernClientError("CAVERN_CLIENT_RESPONSE_INVALID") }
            state = "\(path) — \(lifecycle)"
        } catch {
            state = "Read refused: \(error)"
        }
    }
}

private func required(_ name: String) -> String {
    guard let value = ProcessInfo.processInfo.environment[name], !value.isEmpty else { fatalError("\(name) is required") }
    return value
}
