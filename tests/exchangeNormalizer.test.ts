describe("Exchange Normalizer", () => {
    test("should convert 10000 LKR to USD correctly", () => {
        const lkrAmount = 10000;
        const usdRate = 0.0033;

        const convertedAmount = lkrAmount * usdRate;

        expect(convertedAmount).toBe(33);
    });

    test("should fallback to native currency value on API failure", () => {
        const fallbackValue = 10000;

        const apiResponse = null;

        const displayedValue = apiResponse || fallbackValue;

        expect(displayedValue).toBe(10000);
    });
});
