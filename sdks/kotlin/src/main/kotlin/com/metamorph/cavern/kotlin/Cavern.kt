package com.metamorph.cavern.kotlin

import com.fasterxml.jackson.databind.JsonNode
import com.metamorph.cavern.WebhookVerifier
import com.metamorph.cavern.VerificationReceiptVerifier
import java.time.Duration
import java.time.Instant
import java.nio.file.Path

const val CONTRACT_VERSION: String = "0.1.0-dev.64"

data class CollectionReference(
    val tenantId: String,
    val projectId: String,
    val environmentId: String,
    val collectionInstanceId: String,
)

data class FileReference(
    val tenantId: String,
    val projectId: String,
    val environmentId: String,
    val collectionInstanceId: String,
    val entryId: String,
)

data class GenerationReference(
    val tenantId: String,
    val projectId: String,
    val environmentId: String,
    val collectionInstanceId: String,
    val entryId: String,
    val generationId: String,
)

data class DerivativeReference(
    val tenantId: String,
    val projectId: String,
    val environmentId: String,
    val collectionInstanceId: String,
    val entryId: String,
    val generationId: String,
    val variantKey: String,
)

data class ProjectReference(val tenantId: String, val projectId: String)

class CavernDataClient(
    baseUrl: String,
    capability: () -> String,
    origin: String? = null,
    retry: RetryPolicy = RetryPolicy(),
) {
    private val delegate = com.metamorph.cavern.CavernDataClient(
        baseUrl,
        capability,
        origin,
        com.metamorph.cavern.CavernDataClient.RetryPolicy(retry.maxAttempts, retry.baseDelay, retry.maximumDelay),
    )

    fun listFilesWithCapability(reference: CollectionReference, filters: Map<String, Any?> = emptyMap()): JsonNode =
        delegate.listFilesWithCapability(reference.java(), filters)

    fun searchFilesWithCapability(reference: CollectionReference, request: JsonNode): JsonNode =
        delegate.searchFilesWithCapability(reference.java(), request)

    fun getFileMetadataWithCapability(reference: FileReference): JsonNode =
        delegate.getFileMetadataWithCapability(reference.java())

    fun listDerivativesWithCapability(reference: GenerationReference): JsonNode =
        delegate.listDerivativesWithCapability(reference.java())

    fun readImmutableGeneration(
        reference: GenerationReference,
        range: String? = null,
        ifNoneMatch: String? = null,
    ): com.metamorph.cavern.CavernDataClient.BinaryResponse =
        delegate.readImmutableGeneration(reference.java(), range, ifNoneMatch)

    fun readDerivative(
        reference: DerivativeReference,
        range: String? = null,
        ifNoneMatch: String? = null,
    ): com.metamorph.cavern.CavernDataClient.BinaryResponse =
        delegate.readDerivative(reference.java(), range, ifNoneMatch)

    fun readShare(
        shareToken: String,
        range: String? = null,
        ifNoneMatch: String? = null,
    ): com.metamorph.cavern.CavernDataClient.BinaryResponse =
        delegate.readShare(shareToken, range, ifNoneMatch)
}

data class RetryPolicy(
    val maxAttempts: Int = 1,
    val baseDelay: Duration = Duration.ofMillis(100),
    val maximumDelay: Duration = Duration.ofSeconds(5),
)

class CavernServerClient(baseUrl: String, workloadSession: () -> String) {
    private val delegate = com.metamorph.cavern.CavernServerClient(baseUrl, workloadSession)

    fun createCapabilitySession(reference: CollectionReference, request: JsonNode, operationId: String): JsonNode =
        delegate.createCapabilitySession(reference.java(), request, operationId)

    fun createUpload(reference: CollectionReference, request: JsonNode, operationId: String): JsonNode =
        delegate.createUpload(reference.java(), request, operationId)

    fun createUploadPart(reference: CollectionReference, transferSessionId: String, request: JsonNode, operationId: String): JsonNode =
        delegate.createUploadPart(reference.java(), transferSessionId, request, operationId)

    fun finalizeUpload(reference: CollectionReference, transferSessionId: String, request: JsonNode, operationId: String): JsonNode =
        delegate.finalizeUpload(reference.java(), transferSessionId, request, operationId)

    fun bindSubject(reference: CollectionReference, entryId: String, subject: JsonNode, operationId: String): JsonNode =
        delegate.bindSubject(reference.java(), entryId, subject, operationId)

    fun listSubjectBindings(reference: ProjectReference, request: JsonNode): JsonNode =
        delegate.listSubjectBindings(com.metamorph.cavern.CavernServerClient.ProjectReference(reference.tenantId, reference.projectId), request)

    fun startSubjectLifecycleOperation(reference: ProjectReference, request: JsonNode, operationId: String): JsonNode =
        delegate.startSubjectLifecycleOperation(com.metamorph.cavern.CavernServerClient.ProjectReference(reference.tenantId, reference.projectId), request, operationId)

    fun readSubjectLifecycleOperation(reference: ProjectReference, request: JsonNode): JsonNode =
        delegate.readSubjectLifecycleOperation(com.metamorph.cavern.CavernServerClient.ProjectReference(reference.tenantId, reference.projectId), request)

    fun createSubjectExportDownload(reference: ProjectReference, lifecycleOperationId: String, request: JsonNode, operationId: String): JsonNode =
        delegate.createSubjectExportDownload(com.metamorph.cavern.CavernServerClient.ProjectReference(reference.tenantId, reference.projectId), lifecycleOperationId, request, operationId)

    fun revokeCapabilitySession(reference: CollectionReference, sessionId: String, operationId: String): String =
        delegate.revokeCapabilitySession(reference.java(), sessionId, operationId)
}

fun verifyWebhookSignature(
    secret: ByteArray,
    body: ByteArray,
    headers: Map<String, String>,
    now: Instant = Instant.now(),
    tolerance: Duration = Duration.ofMinutes(5),
): WebhookVerifier.VerifiedWebhook? = WebhookVerifier.verifyWebhookSignature(secret, body, headers, now, tolerance)

data class VerificationReceiptExpectation(
    val verificationId: String? = null,
    val tenantId: String,
    val projectId: String,
    val environmentId: String,
    val collectionInstanceId: String,
    val entryId: String,
    val generationId: String,
    val expectedSizeBytes: Long,
    val contentSha256: String,
)

fun verifyVerificationReceipt(
    signed: JsonNode,
    keySet: JsonNode,
    expected: VerificationReceiptExpectation? = null,
): Boolean = VerificationReceiptVerifier.verify(
    signed,
    keySet,
    expected?.let {
        VerificationReceiptVerifier.Expectation(
            it.verificationId, it.tenantId, it.projectId, it.environmentId,
            it.collectionInstanceId, it.entryId, it.generationId,
            it.expectedSizeBytes, it.contentSha256,
        )
    },
)

fun uploadDirect(
    descriptor: JsonNode,
    source: Path,
    grantPart: ((JsonNode) -> JsonNode)? = null,
): JsonNode = com.metamorph.cavern.DirectTransfer.uploadDirect(
    descriptor,
    source,
    grantPart?.let { callback -> java.util.function.Function { request -> callback(request) } },
)

private fun CollectionReference.java() = com.metamorph.cavern.CavernDataClient.CollectionReference(
    tenantId, projectId, environmentId, collectionInstanceId,
)

private fun FileReference.java() = com.metamorph.cavern.CavernDataClient.FileReference(
    tenantId, projectId, environmentId, collectionInstanceId, entryId,
)

private fun GenerationReference.java() = com.metamorph.cavern.CavernDataClient.GenerationReference(
    tenantId, projectId, environmentId, collectionInstanceId, entryId, generationId,
)

private fun DerivativeReference.java() = com.metamorph.cavern.CavernDataClient.DerivativeReference(
    tenantId, projectId, environmentId, collectionInstanceId, entryId, generationId, variantKey,
)
