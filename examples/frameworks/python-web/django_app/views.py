from __future__ import annotations

import os

from cavern import CavernDataClient, FileReference, RetryPolicy
from django.http import HttpRequest, JsonResponse


def required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"{name} is required")
    return value


client = CavernDataClient(
    base_url=required("CAVERN_BASE_URL"),
    capability=lambda: required("CAVERN_CAPABILITY"),
    retry=RetryPolicy(max_attempts=3, base_delay_seconds=0.1, maximum_delay_seconds=2),
)


def file_metadata(request: HttpRequest, entry_id: str) -> JsonResponse:
    if not request.headers.get("X-App-User"):
        return JsonResponse({"code": "CAVERN_EXAMPLE_FORBIDDEN"}, status=403)
    entry = client.get_file_metadata_with_capability(FileReference(
        required("CAVERN_TENANT_ID"), required("CAVERN_PROJECT_ID"),
        required("CAVERN_ENVIRONMENT_ID"), required("CAVERN_COLLECTION_ID"), entry_id,
    ))
    return JsonResponse(entry)
