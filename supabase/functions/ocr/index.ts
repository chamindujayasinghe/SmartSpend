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

  console.log("OCR + AI receipt processing started");

  try {
    const { images, userCategories } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new Error("An array of base64 images is required");
    }

    if (
      !userCategories || !Array.isArray(userCategories) ||
      userCategories.length === 0
    ) {
      throw new Error(
        "No user categories provided. Please sync categories first.",
      );
    }

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_VISION_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("Google Vision API key missing");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Gemini API key missing");

    // 1. Process all images through Google Vision OCR
    let combinedExtractedText = "";

    // We use Promise.all to process images in parallel for better speed
    const ocrPromises = images.map(async (base64: string, index: number) => {
      const visionRes = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [{ type: "TEXT_DETECTION" }],
              },
            ],
          }),
        },
      );

      const visionJson = await visionRes.json();
      const text = visionJson.responses?.[0]?.fullTextAnnotation?.text ?? "";
      return `--- Image ${index + 1} Text ---\n${text}`;
    });

    const results = await Promise.all(ocrPromises);
    combinedExtractedText = results.join("\n\n");

    if (!combinedExtractedText.replace(/--- Image \d+ Text ---/g, "").trim()) {
      throw new Error("No text detected in any of the provided images");
    }

    console.log(`OCR extracted text from ${images.length} images.`);

    // 2. Send the aggregated text to Gemini AI
    const prompt = `
      You are a receipt analysis assistant. 
      The provided text may come from multiple photos of the same receipt or multiple different receipts.
      
      Extract all products and prices from the text below and categorize them.
      There may be same Extracted raw text content duplicated, figure out them and use only one of them for analysing.

      RECEIPT TEXT:
      """
      ${combinedExtractedText}
      """

      RULES:
      - Extract EVERY purchasable item found across all text parts.
      - Prices must be numbers only.
      - Category must be EXACTLY ONE of: ${userCategories.join(", ")}
      - If category is unclear or not in the list, assign the category: "others" (if "others" is not in the list, use the most generic one available).

      OUTPUT:
      Return ONLY a valid JSON array.

      Example:
      [
        { "product_name": "Coffee", "amount": 400, "category": "Food" }
      ]
    `;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: prompt }],
          }],
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
      if (geminiRes.status === 429) throw new Error("RATE_LIMIT_EXCEEDED");
      throw new Error("Gemini API failed");
    }

    const geminiJson = await geminiRes.json();
    const aiText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!aiText) throw new Error("Empty Gemini response");

    // Robust parsing of JSON from AI response
    let products: Product[] = [];
    try {
      products = JSON.parse(aiText);
    } catch {
      const jsonMatch = aiText.match(/\[[\s\S]*\]/);
      if (jsonMatch) products = JSON.parse(jsonMatch[0]);
      else throw new Error("Invalid AI JSON format");
    }

    // 3. Clean and validate products
    const cleanedProducts = products
      .filter((p) => p.product_name && p.amount)
      .map((p) => ({
        product_name: String(p.product_name).trim(),
        amount: typeof p.amount === "string"
          ? parseFloat(p.amount.replace(/[^0-9.]/g, ""))
          : Number(p.amount),
        category: userCategories.includes(p.category)
          ? p.category
          : (userCategories.includes("Others") ? "Others" : userCategories[0]),
      }))
      .filter((p) => !isNaN(p.amount) && p.amount > 0);

    console.log(
      `Parsed ${cleanedProducts.length} items from ${images.length} images.`,
    );

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
    let friendlyMessage = errorMessage;

    if (errorMessage === "RATE_LIMIT_EXCEEDED") {
      status = 429;
      friendlyMessage =
        "Too many requests! Please wait 30 seconds before trying again.";
    }

    console.error(`OCR + AI error: [${status}]`, errorMessage);

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
