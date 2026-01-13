// ai-document-metadata.schema.ts
export const AiDocumentMetadataSchema = {
    name: "ai_document_metadata",
    schema: {
        type: "object",
        additionalProperties: false,
        required: ["title", "docType", "permission"],
        properties: {
            title: { type: "string" },
            docType: {
                type: "string",
                enum: ["runbook", "adr", "manual", "law"]
            },
            permission: {
                type: "array",
                items: {
                    type: "string",
                    enum: ["USER", "ADMIN"]
                }
            },
            summary: { type: "string" }
        }
    }
};
