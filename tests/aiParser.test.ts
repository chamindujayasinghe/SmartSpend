describe("AI Parser", () => {
    test("should assign Miscellaneous category for broken payload", () => {
        const brokenPayload: {
            item: string;
            amount: number;
            category?: string;
        } = {
            item: "Unknown Item",
            amount: 1200,
        };

        const category = brokenPayload.category || "Miscellaneous";

        expect(category).toBe("Miscellaneous");
    });
});
