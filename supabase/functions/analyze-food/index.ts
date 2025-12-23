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
    const { imageBase64, analysisType = "food" } = await req.json();
    
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

    console.log(`Analyzing ${analysisType} image with AI...`);

    // Different prompts for food analysis vs waste analysis
    const systemPrompt = analysisType === "waste" 
      ? `You are an expert food waste analyst. Analyze the image of leftover food/plate after eating and estimate the food waste.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "wastedItems": ["item1", "item2"],
  "estimatedWasteGrams": 150,
  "wastePercentage": 25,
  "wastedKgCO2": 0.8,
  "wasteCategory": "Medium",
  "resourcesLost": {
    "waterLiters": 120,
    "landSqMeters": 0.5,
    "energyKwh": 2.1
  },
  "wasteComparison": "Equivalent to leaving a light on for 8 hours",
  "wasteTip": "A helpful tip to reduce food waste next time",
  "confidence": 90
}

Waste estimation guidelines:
- Empty/clean plate: 0% waste
- Few scraps: 5-15% waste  
- Significant leftovers: 20-40% waste
- Most food uneaten: 50-80% waste
- Untouched: 90-100% waste

Resource impact per kg of wasted food:
- Water: 500-15,000 liters (avg 1,000L)
- Land: 1-5 sq meters
- Energy: 5-15 kWh
- CO2: varies by food type

wasteCategory thresholds:
- Low: < 10% waste
- Medium: 10-30% waste  
- High: > 30% waste

Be precise in identifying what was left uneaten.`
      : `You are an expert food analyst specializing in carbon footprint estimation. Analyze the food image and provide accurate carbon emissions data.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "name": "Name of the dish/food",
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
  "estimatedWeightGrams": 450,
  "kgCO2": 2.5,
  "label": "Medium",
  "comparison": "Driving X miles in an average car",
  "resourcesUsed": {
    "waterLiters": 500,
    "landSqMeters": 2.5,
    "energyKwh": 8.5
  },
  "potentialWaste": {
    "typicalWastePercent": 15,
    "potentialWastedKgCO2": 0.4,
    "potentialWaterWasted": 75,
    "preventionTip": "Tips to minimize waste for this dish"
  },
  "qualityScore": 75,
  "qualityNotes": "Assessment of food preparation, freshness, and sustainability of ingredients",
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

Resource usage per kg of food production:
- Beef: 15,000L water, 20 sqm land
- Chicken: 4,300L water, 5 sqm land
- Vegetables: 300L water, 0.5 sqm land
- Grains: 1,600L water, 1.5 sqm land

Label thresholds:
- Low: < 1 kg CO2
- Medium: 1-4 kg CO2
- High: > 4 kg CO2

Quality score (0-100) based on:
- Freshness/appearance
- Sustainable sourcing indicators
- Nutritional balance
- Local vs imported ingredients
- Organic/conventional

Typical waste percentages by food type:
- Salads/Vegetables: 15-25%
- Meat dishes: 10-20%
- Pasta/Rice: 5-15%
- Bread: 20-30%
- Beverages: 5-10%

Comparison formula: 1 kg CO2 ≈ 4 miles of driving

Be precise and identify ALL items in the image including drinks. Estimate weight carefully. If you see multiple items, calculate totals. Only set confidence above 90 if you can clearly identify the food.`;

    const userPrompt = analysisType === "waste"
      ? "Analyze this image of leftover food/plate after eating. Identify what was wasted, estimate the waste amount and its environmental impact. Provide the response in the exact JSON format specified."
      : "Analyze this food image. Identify what food and drinks are shown, estimate the weight, carbon footprint, resources used, potential waste, and quality. Provide the response in the exact JSON format specified.";

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
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt
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
    let result;
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
      
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the response structure based on analysis type
    if (analysisType === "waste") {
      if (!result.wastedItems || result.estimatedWasteGrams === undefined) {
        console.error("Invalid waste response structure:", result);
        return new Response(
          JSON.stringify({ error: "Invalid waste analysis response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Successfully analyzed waste:", result.wastedItems);
    } else {
      if (!result.name || !result.kgCO2 || !result.label) {
        console.error("Invalid response structure:", result);
        return new Response(
          JSON.stringify({ error: "Invalid food analysis response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Successfully analyzed food:", result.name);
    }

    return new Response(
      JSON.stringify({ result }),
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
