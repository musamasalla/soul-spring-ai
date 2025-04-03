import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { OpenAI } from 'https://esm.sh/openai@4.0.0';

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// Setup CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    // Parse request body
    const { text, voice = 'nova', model = 'tts-1', speed = 1.0, userId } = await req.json();
    
    // Validate input
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text input is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for voice type validity
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const selectedVoice = validVoices.includes(voice) ? voice : 'nova';
    
    // Check for model validity
    const validModels = ['tts-1', 'tts-1-hd'];
    const selectedModel = validModels.includes(model) ? model : 'tts-1';
    
    // Normalize speed
    const normalizedSpeed = Math.min(Math.max(0.25, speed), 4.0);
    
    // Generate speech with OpenAI
    const response = await openai.audio.speech.create({
      model: selectedModel,
      voice: selectedVoice,
      input: text,
      speed: normalizedSpeed,
    });
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Log usage in the database
    await supabaseClient.from('tts_usage').insert({
      user_id: userId,
      characters: text.length,
      model: selectedModel,
      voice: selectedVoice,
      content_snippet: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    });
    
    // Convert to arrayBuffer and return
    const buffer = await response.arrayBuffer();
    
    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800' // Cache for a week
      }
    });
  } catch (error) {
    console.error('Error in OpenAI TTS endpoint:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Error generating speech' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 