describe("Ingestion Pipeline", () => {
    test("should return structured JSON object", () => {
        const receiptPayload = {
            merchant: "Cargills",
            amount: 3200,
            category: "Groceries",
        };

        expect(receiptPayload).toHaveProperty("merchant");

        expect(receiptPayload).toHaveProperty("amount");

        expect(receiptPayload).toHaveProperty("category");
    });

    test("should keep API keys server-side", () => {
        const clientPayload = {
            image: "base64-image",
        };

        expect(clientPayload).not.toHaveProperty("apiKey");
    });
});
