import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing food image with AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert food analyst specializing in carbon footprint estimation. Analyze the food image and provide accurate carbon emissions data.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "name": "Name of the dish/food",
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
  "kgCO2": 2.5,
  "label": "Medium",
  "comparison": "Driving X miles in an average car",
  "tip": "A helpful eco-friendly tip about this food choice",
  "confidence": 95
}

Carbon footprint guidelines per kg of food:
- Beef: 27 kg CO2e
- Lamb: 22 kg CO2e
- Cheese: 13.5 kg CO2e
- Pork: 7 kg CO2e
- Chicken: 4.5 kg CO2e
- Fish: 3-6 kg CO2e
- Eggs: 4.5 kg CO2e
- Rice: 2.7 kg CO2e
- Pasta/Bread: 1.2 kg CO2e
- Vegetables: 0.5-2 kg CO2e
- Fruits: 0.3-1 kg CO2e
- Wine (per glass): 0.2-0.5 kg CO2e
- Beer (per pint): 0.3 kg CO2e

Label thresholds:
- Low: < 1 kg CO2
- Medium: 1-4 kg CO2
- High: > 4 kg CO2

Comparison formula: 1 kg CO2 ≈ 4 miles of driving

Be precise and identify ALL items in the image including drinks. If you see multiple items, calculate the total. Only set confidence above 90 if you can clearly identify the food.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image. Identify what food and drinks are shown, estimate the carbon footprint, and provide the response in the exact JSON format specified."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI response:", content);

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from AI
    let foodResult;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      foodResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse food analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the response structure
    if (!foodResult.name || !foodResult.kgCO2 || !foodResult.label) {
      console.error("Invalid response structure:", foodResult);
      return new Response(
        JSON.stringify({ error: "Invalid food analysis response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully analyzed food:", foodResult.name);

    return new Response(
      JSON.stringify({ result: foodResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-food function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
