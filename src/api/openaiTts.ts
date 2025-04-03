import { supabase } from '../lib/supabaseClient';

interface TTSRequest {
  text: string;
  voice?: string;
  model?: string;
  speed?: number;
  userId: string;
}

export const generateSpeech = async (params: TTSRequest): Promise<Blob> => {
  try {
    // Use Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('openai-tts', {
      body: JSON.stringify(params),
    });

    if (error) {
      console.error('Error calling TTS function:', error);
      throw new Error(error.message || 'Error generating speech');
    }

    // Convert base64 to Blob if needed (depends on how the edge function returns data)
    if (typeof data === 'string' && data.startsWith('data:audio/')) {
      const base64Data = data.split(',')[1];
      const binaryData = atob(base64Data);
      const byteArray = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        byteArray[i] = binaryData.charCodeAt(i);
      }
      return new Blob([byteArray], { type: 'audio/mpeg' });
    }
    
    // If data is already in the right format (ArrayBuffer or Blob)
    if (data instanceof ArrayBuffer) {
      return new Blob([data], { type: 'audio/mpeg' });
    }
    
    if (data instanceof Blob) {
      return data;
    }
    
    throw new Error('Invalid response format from TTS function');
  } catch (error) {
    console.error('Speech generation error:', error);
    throw error;
  }
};

export default {
  generateSpeech
}; 