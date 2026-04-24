const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    console.log("Generating Professional AI Insight...");

    try {
        const {
            globalCurrency,
            totalPrevIncome,
            totalCurrentIncome,
            lastMonthExpenses,
            currentMonthExpenses,
        } = await req.json();

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            throw new Error("Gemini API key missing in environment variables");
        }

        // UPDATED PROMPT: Professional, analytical, and strictly under 20 words.
        // Inside index.ts Edge Function

        // ... inside Deno.serve ...

        const prompt = `
  You are a gamified financial coach. Compare this month's category spending to last month.
  
  DATA (${globalCurrency}):
  - Last Month: ${JSON.stringify(lastMonthExpenses)}
  - Current Month: ${JSON.stringify(currentMonthExpenses)}

  INSTRUCTIONS:
  1. Start with a "Win" (where spending dropped) and a "Challenge" (where spending rose).
  2. Use a gamified, encouraging tone (e.g., "Level up!", "Boss move!").
  3. Suggest one specific, actionable way to reduce the "Challenge" category.
  4. LENGTH: You MUST write between 20 and 25 word. 
  5. FORMAT: Plain text only. No markdown, no asterisks, no emojis.

  "Great job keeping dining expenses down this month! However, your 'Entertainment' spending is up 20% compared to last month. Try finding free local events to lower this!"
  this is an example rensponse.
`;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7, // Increased to allow for more descriptive natural language
                        maxOutputTokens: 100, // Increased to ensure the sentence isn't cut off mid-way
                        topP: 0.9,
                    },
                }),
            },
        );

        if (!geminiRes.ok) {
            const errData = await geminiRes.json();
            console.error("Gemini error details:", JSON.stringify(errData));
            throw new Error("Gemini API failed");
        }

        const geminiJson = await geminiRes.json();
        const aiText =
            geminiJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

        if (!aiText) throw new Error("Empty Gemini response");

        return new Response(
            JSON.stringify({ success: true, insight: aiText }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error
            ? error.message
            : "An unknown error occurred";
        console.error(`Insight Generation error:`, errorMessage);

        return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
