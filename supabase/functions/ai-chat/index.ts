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
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = `Você é o assistente virtual da SD Móveis Projetados, especialista em móveis planejados e design de interiores.
    
Suas capacidades incluem:
- Sugerir layouts otimizados para cozinhas, dormitórios, salas e escritórios
- Recomendar combinações de módulos baseado nas dimensões do ambiente
- Orientar sobre acabamentos e tendências de design
- Calcular dimensões ideais para aproveitamento do espaço
- Ajudar com atendimento ao cliente de forma profissional

Responda sempre de forma profissional, detalhada e amigável em português brasileiro.
Quando sugerir módulos, inclua dimensões específicas (L x A x P em mm).
Quando falar sobre acabamentos, mencione tendências atuais e combinações harmoniosas.`;
    
    if (type === "render") {
      systemPrompt = "Você é um especialista em design de interiores e móveis planejados. Descreva a renderização de forma detalhada e profissional, destacando os materiais, acabamentos e como a iluminação valoriza o ambiente.";
    }
    
    if (type === "whatsapp") {
      systemPrompt = `Você é o assistente de atendimento da SD Móveis Projetados no WhatsApp.
      
Seu papel é:
- Atender clientes de forma cordial e profissional
- Responder dúvidas sobre projetos e orçamentos
- Agendar visitas técnicas
- Informar sobre prazos e processos
- Encaminhar para o projetista quando necessário

Mantenha respostas concisas (máximo 3 parágrafos) e use emojis com moderação para tornar a conversa mais amigável.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro no gateway de IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
