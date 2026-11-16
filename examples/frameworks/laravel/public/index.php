<?php

declare(strict_types=1);

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Metamorph\Cavern\CavernDataClient;
use Metamorph\Cavern\FileReference;
use Metamorph\Cavern\RetryPolicy;

require dirname(__DIR__) . '/vendor/autoload.php';

$required = static function (string $name): string {
    $value = getenv($name);
    if ($value === false || $value === '') throw new RuntimeException("$name is required");
    return $value;
};

$container = new Container();
$router = new Router(new Dispatcher($container), $container);
$router->get('/files/{entryId}', function (Request $request, string $entryId) use ($required): JsonResponse {
    if ($request->header('X-App-User') === null) {
        return new JsonResponse(['code' => 'CAVERN_EXAMPLE_FORBIDDEN'], 403);
    }
    $client = new CavernDataClient(
        $required('CAVERN_BASE_URL'),
        fn(): string => $required('CAVERN_CAPABILITY'),
        retry: new RetryPolicy(3, 0.1, 2),
    );
    $entry = $client->getFileMetadataWithCapability(new FileReference(
        $required('CAVERN_TENANT_ID'), $required('CAVERN_PROJECT_ID'),
        $required('CAVERN_ENVIRONMENT_ID'), $required('CAVERN_COLLECTION_ID'), $entryId,
    ));
    return new JsonResponse($entry);
});

$router->dispatch(Request::capture())->send();
