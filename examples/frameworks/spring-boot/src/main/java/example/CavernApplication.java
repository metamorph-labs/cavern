package example;

import com.fasterxml.jackson.databind.JsonNode;
import com.metamorph.cavern.CavernDataClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class CavernApplication {
    public static void main(String[] args) { SpringApplication.run(CavernApplication.class, args); }

    @RestController
    static final class FilesController {
        private final CavernDataClient client = new CavernDataClient(
            required("CAVERN_BASE_URL"), () -> required("CAVERN_CAPABILITY"), null,
            new CavernDataClient.RetryPolicy(3, java.time.Duration.ofMillis(100), java.time.Duration.ofSeconds(2))
        );

        @GetMapping("/files/{entryId}")
        JsonNode read(@RequestHeader(value = "X-App-User", required = false) String appUser,
                      @PathVariable String entryId) {
            if (appUser == null || appUser.isBlank()) throw new Forbidden();
            return client.getFileMetadataWithCapability(new CavernDataClient.FileReference(
                required("CAVERN_TENANT_ID"), required("CAVERN_PROJECT_ID"),
                required("CAVERN_ENVIRONMENT_ID"), required("CAVERN_COLLECTION_ID"), entryId
            ));
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    static final class Forbidden extends RuntimeException {}

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException(name + " is required");
        return value;
    }
}
