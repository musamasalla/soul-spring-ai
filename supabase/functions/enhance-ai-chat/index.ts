
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In a production environment, you would connect to OpenAI here
// const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");
    
    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token or user not found" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse request body
    const { message, isPremium } = await req.json();

    // Check usage limit for non-premium users
    if (!isPremium) {
      const { data: usageData } = await supabaseClient
        .from('ai_chat_usage')
        .select('count')
        .eq('user_id', user.id)
        .eq('month', new Date().getMonth() + 1) // Current month, 1-indexed
        .eq('year', new Date().getFullYear())
        .single();

      const currentCount = usageData?.count || 0;
      const MAX_FREE_MESSAGES = 10;

      if (currentCount >= MAX_FREE_MESSAGES) {
        return new Response(
          JSON.stringify({ 
            error: "Usage limit reached", 
            message: "You've reached your monthly limit for AI therapy messages. Upgrade to premium for unlimited access."
          }),
          { 
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Update usage count
      await supabaseClient
        .from('ai_chat_usage')
        .upsert({ 
          user_id: user.id, 
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          count: currentCount + 1 
        });
    }

    // In a real implementation, you would call the OpenAI API here
    // This is a mock response for demonstration purposes
    
    const mockResponses = [
      "I understand that must be challenging. Can you tell me more about how that makes you feel?",
      "Thank you for sharing that with me. How long have you been experiencing these feelings?",
      "It sounds like you're going through a lot right now. What has helped you cope with similar situations in the past?",
      "That's a significant concern. Have you talked to anyone else about this?",
      "I hear you're struggling with this. Let's explore some strategies that might help you manage these feelings.",
      "It's completely normal to feel that way. Many people have similar experiences when facing these kinds of situations.",
      "Your feelings are valid. What do you think triggered these emotions?",
      "That must be difficult to deal with. How has this been affecting your daily life?",
      "I'm here to support you. What would be most helpful for you right now?",
      "Thank you for your openness. Let's work together to find ways to improve this situation."
    ];
    
    // Add premium-only advanced responses
    const premiumResponses = [
      "Based on what you've shared and our previous conversations, I notice a pattern that might be worth exploring further. Would it help to discuss some deeper cognitive approaches to address this?",
      "I've been analyzing our conversation history, and I see connections between this and topics we've discussed before. Would you like me to share some insights about potential underlying factors?",
      "The experiences you're describing align with research on this topic. There are some evidence-based techniques specifically designed for this situation that we could explore together.",
      "Taking a holistic approach to what you've shared, I can see several interconnected factors at play. Let's develop a comprehensive strategy that addresses all of these areas."
    ];
    
    // Select a response based on premium status
    let aiResponses = mockResponses;
    if (isPremium) {
      aiResponses = [...mockResponses, ...premiumResponses];
    }
    
    const responseIndex = Math.floor(Math.random() * aiResponses.length);
    const aiResponse = aiResponses[responseIndex];
    
    // Log the interaction
    await supabaseClient
      .from('ai_chat_history')
      .insert({
        user_id: user.id,
        user_message: message,
        ai_response: aiResponse,
        is_premium_response: isPremium && responseIndex >= mockResponses.length
      });
    
    // In a production app, we'd send the message to OpenAI and get a real response

    console.log(`Processed AI chat for user ${user.id}. Premium: ${isPremium}`);

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        premium_features_used: isPremium
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error processing AI chat:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
