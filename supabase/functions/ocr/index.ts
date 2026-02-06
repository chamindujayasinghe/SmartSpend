const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
interface Product {
  product_name: string;
  amount: number | string;
  category: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log(" OCR + AI receipt processing started");

  try {
    // Read input
    const { imageBase64, userCategories } = await req.json();
    if (!imageBase64) throw new Error("imageBase64 is required");
    if (
      !userCategories || !Array.isArray(userCategories) ||
      userCategories.length === 0
    ) {
      throw new Error(
        "No user categories provided. Please sync categories first.",
      );
    }

    // Google Vision OCR
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_VISION_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("Google Vision API key missing");

    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [{ type: "TEXT_DETECTION" }],
            },
          ],
        }),
      },
    );

    const visionJson = await visionRes.json();
    const extractedText = visionJson.responses?.[0]?.fullTextAnnotation?.text ??
      "";

    if (!extractedText.trim()) {
      throw new Error("No text detected in image");
    }

    console.log(" OCR extracted text length:", extractedText.length);

    // Gemini AI
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Gemini API key missing");

    const prompt = `
      You are a receipt analysis assistant.

      Extract all products and prices from the receipt text below
      and categorize them.

      RECEIPT TEXT:
      """
      ${extractedText}
      """

      RULES:
      - Extract EVERY purchasable item
      - Prices must be numbers only
      - Category must be ONE of:
      ${userCategories.join(", ")}
      - If category is unclear, assign the category name (others)

      OUTPUT:
      Return ONLY a valid JSON array.

      Example:
      [
        { "product_name": "Coffee", "amount": 400, "category": "Food" }
      ]
    `;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
            response_mime_type: "application/json",
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json();
      console.error("Gemini error details:", JSON.stringify(errData));

      if (geminiRes.status === 429) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }

      throw new Error("Gemini API failed");
    }

    const geminiJson = await geminiRes.json();
    const aiText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!aiText) throw new Error("Empty Gemini response");

    console.log(" Gemini response received");

    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Invalid AI JSON");

    const products: Product[] = JSON.parse(aiText);

    const cleanedProducts = products
      .filter((p) => p.product_name && p.amount)
      .map((p) => ({
        product_name: String(p.product_name).trim(),
        amount: Number(p.amount),
        category: userCategories.includes(p.category)
          ? p.category
          : userCategories[0],
      }))
      .filter((p) => p.amount > 0);

    console.log(` Parsed ${cleanedProducts.length} items`);

    return new Response(
      JSON.stringify({ success: true, products: cleanedProducts }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred";

    let status = 500;
    let friendlyMessage = "Failed to process receipt. Please try again.";

    if (errorMessage === "RATE_LIMIT_EXCEEDED") {
      status = 429;
      friendlyMessage =
        "Too many requests! Please wait 30 seconds before trying again.";
    }

    console.error(` OCR + AI error: [${status}]`, errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: friendlyMessage,
        code: errorMessage,
        products: [],
      }),
      {
        status: status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
