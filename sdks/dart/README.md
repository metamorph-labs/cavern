# Cavern Dart and Flutter SDK

`metamorph_cavern` implements promoted Cavern contract `0.1.0-dev.64` for Dart and Flutter.

- `package:metamorph_cavern/cavern.dart` is the mobile-safe capability client. It provides all
  metadata, search, immutable-generation, derivative and share reads as byte streams. Rotating
  capabilities resolve per attempt and share reads forward no credential.
- `package:metamorph_cavern/cavern_server.dart` is a separate opt-in server library for trusted
  Dart processes. It provides short-lived workload exchange, upload ceremonies, builder-subject
  lifecycle operations and APP-01 webhook verification.

The mobile-safe library exports `verifyVerificationReceipt`, which validates the closed canonical
receipt, Ed25519 signature and optional exact expected binding against a trusted key set.

Neither library contains management operations. Run `dart test sdks/dart` from the repository
root.
