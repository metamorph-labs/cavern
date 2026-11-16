package example

import com.metamorph.cavern.kotlin.CavernDataClient
import com.metamorph.cavern.kotlin.FileReference
import com.metamorph.cavern.kotlin.RetryPolicy
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.jackson.jackson
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import java.time.Duration

fun main() {
    val client = CavernDataClient(
        baseUrl = required("CAVERN_BASE_URL"),
        capability = { required("CAVERN_CAPABILITY") },
        retry = RetryPolicy(3, Duration.ofMillis(100), Duration.ofSeconds(2)),
    )
    embeddedServer(Netty, port = 8080) {
        install(ContentNegotiation) { jackson() }
        routing {
            get("/files/{entryId}") {
                if (call.request.headers["X-App-User"].isNullOrBlank()) {
                    call.respond(HttpStatusCode.Forbidden, mapOf("code" to "CAVERN_EXAMPLE_FORBIDDEN"))
                    return@get
                }
                val entryId = call.parameters["entryId"] ?: return@get call.respond(HttpStatusCode.BadRequest)
                call.respond(client.getFileMetadataWithCapability(FileReference(
                    required("CAVERN_TENANT_ID"), required("CAVERN_PROJECT_ID"),
                    required("CAVERN_ENVIRONMENT_ID"), required("CAVERN_COLLECTION_ID"), entryId,
                )))
            }
        }
    }.start(wait = true)
}

private fun required(name: String): String =
    System.getenv(name)?.takeIf { it.isNotBlank() } ?: error("$name is required")
