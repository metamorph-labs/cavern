# Cavern Kotlin SDK

The Kotlin SDK is the idiomatic JVM facade for Cavern application integrations. It delegates all
transport and credential isolation to the Java core so Java and Kotlin cannot drift at the wire
boundary, while exposing Kotlin data classes, nullable arguments and conventional camel-case
methods.

`verifyVerificationReceipt` delegates to the Java Ed25519 verifier and accepts an idiomatic
`VerificationReceiptExpectation` for exact resource binding.

It implements the complete capability-data and builder-workload surfaces from promoted contract
`0.1.0-dev.64`; it deliberately contains no Cavern management API. Run
`gradle -p sdks/jvm :kotlin:test` from the repository root.
