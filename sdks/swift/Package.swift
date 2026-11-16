// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Cavern",
    platforms: [.macOS(.v13), .iOS(.v16), .tvOS(.v16), .watchOS(.v9)],
    products: [
        .library(name: "Cavern", targets: ["Cavern"]),
        .library(name: "CavernServer", targets: ["CavernServer"]),
    ],
    targets: [
        .target(name: "Cavern"),
        .target(name: "CavernServer", dependencies: ["Cavern"]),
        .testTarget(name: "CavernTests", dependencies: ["Cavern", "CavernServer"]),
    ]
)
