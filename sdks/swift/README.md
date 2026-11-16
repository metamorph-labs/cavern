# Cavern Swift SDK

The Swift 6 package targets Apple application development against promoted Cavern contract
`0.1.0-dev.64`.

- Import `Cavern` in iOS, macOS, tvOS or watchOS applications for capability-backed metadata,
  search, immutable-generation, derivative and share reads. Response bodies are asynchronous
  streams, rotating capabilities resolve per attempt, and share reads forward no credential.
- Import `CavernServer` only in a trusted server process for workload-to-capability exchange,
  upload creation/finalization, subject lifecycle operations and APP-01 webhook verification.

`verifyVerificationReceipt` is available from the mobile-safe `Cavern` module. Supply a trusted key
set and `VerificationReceiptExpectation`; malformed, tampered or differently bound receipts fail.

Neither module contains management operations. Run `swift test --package-path sdks/swift` from the
repository root.
