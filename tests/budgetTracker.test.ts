describe("Budget Tracker", () => {
    test("should decrement remaining balance correctly", () => {
        const initialBudget = 15000;

        const transactions = [2000, 3000, 2500];

        const totalSpent = transactions.reduce((a, b) => a + b, 0);

        const remainingBalance = initialBudget - totalSpent;

        expect(remainingBalance).toBe(7500);
    });

    test("should trigger over-limit warning", () => {
        const limit = 15000;

        const spent = 15001;

        const isExceeded = spent > limit;

        expect(isExceeded).toBe(true);
    });
});
