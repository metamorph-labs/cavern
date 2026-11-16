using Metamorph.Cavern;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton(new CavernDataClient(
    Required("CAVERN_BASE_URL"),
    _ => ValueTask.FromResult(Required("CAVERN_CAPABILITY")),
    retry: new RetryPolicy(3, TimeSpan.FromMilliseconds(100), TimeSpan.FromSeconds(2))));
var app = builder.Build();

app.MapGet("/files/{entryId}", async (HttpRequest request, string entryId, CavernDataClient client) =>
{
    if (string.IsNullOrWhiteSpace(request.Headers["X-App-User"]))
        return Results.Json(new { code = "CAVERN_EXAMPLE_FORBIDDEN" }, statusCode: 403);
    var entry = await client.GetFileMetadataWithCapability(new FileReference(
        Required("CAVERN_TENANT_ID"), Required("CAVERN_PROJECT_ID"),
        Required("CAVERN_ENVIRONMENT_ID"), Required("CAVERN_COLLECTION_ID"), entryId));
    return Results.Json(entry);
});

app.Run();

static string Required(string name) => Environment.GetEnvironmentVariable(name) is { Length: > 0 } value
    ? value : throw new InvalidOperationException($"{name} is required");
