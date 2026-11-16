// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "CavernSwiftUIExample",
    platforms: [.macOS(.v13)],
    dependencies: [.package(path: "../../../sdks/swift")],
    targets: [
        .executableTarget(
            name: "CavernSwiftUIExample",
            dependencies: [.product(name: "Cavern", package: "swift")]
        ),
    ]
)
