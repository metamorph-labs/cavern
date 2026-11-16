from __future__ import annotations

import os

from cavern import CavernDataClient, FileReference, RetryPolicy
from fastapi import FastAPI, Header, HTTPException


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
app = FastAPI()


@app.get("/files/{entry_id}")
def file_metadata(entry_id: str, x_app_user: str | None = Header(default=None)) -> object:
    if not x_app_user:
        raise HTTPException(status_code=403, detail={"code": "CAVERN_EXAMPLE_FORBIDDEN"})
    return client.get_file_metadata_with_capability(FileReference(
        required("CAVERN_TENANT_ID"), required("CAVERN_PROJECT_ID"),
        required("CAVERN_ENVIRONMENT_ID"), required("CAVERN_COLLECTION_ID"), entry_id,
    ))
