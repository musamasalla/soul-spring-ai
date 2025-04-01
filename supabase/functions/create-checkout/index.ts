
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Parse request body to get plan details
    const { planId } = await req.json();
    
    // In a production environment, integrate with Stripe here
    // This is a mock implementation for demonstration
    
    // Mock checkout session data
    const checkoutSession = {
      id: `cs_${Math.random().toString(36).substring(2, 15)}`,
      url: "https://example.com/checkout/success?session_id=mock_session",
      // In a real implementation, this would be the URL to redirect to Stripe's checkout page
    };

    // For demonstration, update the user's profile to premium status
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        is_premium: true,
        ai_messages_limit: 999,
        journal_entries_limit: 999
      })
      .eq('id', user.id);
      
    if (updateError) {
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }

    console.log(`Created checkout session for user ${user.id}: ${checkoutSession.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        session: checkoutSession
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
