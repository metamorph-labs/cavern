rootProject.name = "cavern-ktor-example"
include(":java", ":kotlin")
project(":java").projectDir = file("../../../sdks/java")
project(":kotlin").projectDir = file("../../../sdks/kotlin")
