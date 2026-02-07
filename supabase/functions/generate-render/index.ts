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
    const { room, finish, modules, quality, lighting, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const moduleDescriptions = modules?.map((m: any) => 
      `${m.type} (${m.width}x${m.height}x${m.depth}mm) em acabamento ${m.finish}`
    ).join(", ") || "móveis planejados modernos premium";

    // Map lighting options
    const lightingMap: Record<string, string> = {
      daylight: "bright natural daylight streaming through windows, midday sun",
      evening: "warm golden hour sunset lighting, soft orange ambient glow",
      night: "elegant nighttime interior lighting, warm artificial lights, cozy atmosphere"
    };

    // Map style options  
    const styleMap: Record<string, string> = {
      realistic: "photorealistic, ultra-detailed, professional architectural photography",
      artistic: "artistic architectural visualization, dramatic lighting, magazine quality",
      minimal: "clean minimalist design, simple elegant composition, scandinavian style"
    };

    const lightingDesc = lightingMap[lighting] || lightingMap.daylight;
    const styleDesc = styleMap[style] || styleMap.realistic;

    const prompt = `Professional interior design photograph of a modern ${room} with custom-designed furniture. 
Features: ${moduleDescriptions}. 
Wood finish: ${finish}, high-quality laminate with natural grain texture.
Lighting: ${lightingDesc}.
Style: ${styleDesc}.
Ultra high resolution 4K render, realistic reflections on surfaces, premium materials, luxury Brazilian interior design.
Professional architectural photography, showroom quality, perfect composition.`;

    console.log("Generating render with prompt:", prompt);

    // Use the correct image generation endpoint
    const response = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: quality === "high" ? "1792x1024" : "1024x1024",
        quality: quality === "high" ? "hd" : "standard",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Render API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Aguarde um momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para gerar imagem." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`Erro ao gerar renderização: ${errorText}`);
    }

    const data = await response.json();
    console.log("Render API response:", JSON.stringify(data));
    
    // Extract image URL from the correct response structure
    const imageUrl = data.data?.[0]?.url;
    
    if (!imageUrl) {
      console.error("No image URL in response:", data);
      throw new Error("Imagem não foi gerada. Tente novamente.");
    }

    return new Response(JSON.stringify({ imageUrl, description: prompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Render error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido ao gerar imagem" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
