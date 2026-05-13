import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { AggregatedCategory } from "../app/screens/components/stats/CategorySummaryListItem";

export interface ReportParams {
    aggregatedData: AggregatedCategory[];
    totalAmount: number;
    selectedPeriod: string;
    currentDate: Date;
    selectedTab: "incomes" | "expenses";
    currency: string;
}

export const handleReportDownload = async ({
    aggregatedData,
    totalAmount,
    selectedPeriod,
    currentDate,
    selectedTab,
    currency,
}: ReportParams) => {
    try {
        // 1. Format the date for the report title
        const dateTitle = selectedPeriod === "Monthly"
            ? currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
            })
            : currentDate.getFullYear().toString();

        const reportType = selectedTab === "incomes" ? "Income" : "Expense";

        // 2. Build the HTML table rows
        const tableRows = aggregatedData
            .map((item) => {
                const percentage = ((item.totalAmount / totalAmount) * 100)
                    .toFixed(1);
                return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.category}</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${currency} ${
                    item.totalAmount.toFixed(2)
                }</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${percentage}%</td>
          </tr>
        `;
            })
            .join("");

        // 3. Create the full HTML string
        const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; color: #222; }
            h2 { text-align: center; color: #555; font-weight: normal; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f4f4f4; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
            th.right { text-align: right; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Financial Report</h1>
          <h2>${reportType} Summary - ${dateTitle}</h2>
          
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th class="right">Amount</th>
                <th class="right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td style="padding: 12px;">Total ${reportType}</td>
                <td style="padding: 12px; text-align: right;">${currency} ${
            totalAmount.toFixed(2)
        }</td>
                <td style="padding: 12px; text-align: right;">100%</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

        // 4. Generate the PDF
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        // 5. Share / Save the PDF
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(uri, {
                mimeType: "application/pdf",
                dialogTitle: "Download Financial Report",
                UTI: "com.adobe.pdf",
            });
        } else {
            console.warn("Sharing is not available on this device");
        }
    } catch (error) {
        console.error("Error generating report:", error);
    }
};
