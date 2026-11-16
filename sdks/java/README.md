# Cavern Java SDK

The Java 17+ Cavern application SDK implements the promoted capability-only data plane and the
short-lived builder-workload operations. It contains no project, environment, collection, CDN,
compliance, billing or other management operations.

`CavernDataClient` accepts only rotating `cav_cap_v1` or `cav_local_v1` capabilities. Share reads
send no credential. `CavernServerClient` is a separate server-side client that accepts only a
short-lived `MetamorphWorkload` session for capability exchange, upload ceremonies and subject
lifecycle operations. Streaming bodies remain closeable `InputStream` values.

`VerificationReceiptVerifier.verify` performs closed-shape canonical Ed25519 verification against
Cavern's trusted public key set and an optional exact resource expectation.

The package targets contract `0.1.0-dev.64`. Run `gradle -p sdks/jvm :java:test` from the
repository root.
