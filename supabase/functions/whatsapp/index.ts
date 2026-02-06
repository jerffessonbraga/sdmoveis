import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Webhook verification
    if (req.method === "GET" && url.searchParams.get("hub.mode") === "subscribe") {
      const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
      if (url.searchParams.get("hub.verify_token") === verifyToken) {
        return new Response(url.searchParams.get("hub.challenge"), { headers: corsHeaders });
      }
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));

    // Get conversations
    if (action === "conversations") {
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("*, whatsapp_messages(*)")
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const result = (data || []).map((conv: any) => {
        const msgs = conv.whatsapp_messages || [];
        const last = msgs.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        return { ...conv, lastMessage: last?.content || "", unreadCount: 0 };
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get messages
    if (action === "messages") {
      const conversationId = url.searchParams.get("conversationId");
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send message
    if (action === "send") {
      const { conversationId, message } = body;
      
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .insert({
          conversation_id: conversationId,
          direction: "outbound",
          content: message,
          status: "delivered",
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: data, mode: "simulation" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
