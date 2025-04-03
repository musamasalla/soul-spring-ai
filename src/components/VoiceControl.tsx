import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Badge, 
  Menu, 
  MenuItem, 
  Typography, 
  Slider, 
  Divider,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Tune as TuneIcon,
  Woman as WomanIcon,
  Man as ManIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useEnhancedSpeechToText } from '../utils/enhancedSpeechToText';
import { useEnhancedTextToSpeech } from '../utils/enhancedTextToSpeech';

interface VoiceControlProps {
  onUserSpeech: (text: string) => void;
  onAIResponse: (text: string) => Promise<void>;
  autoReadResponses?: boolean;
  disabled?: boolean;
  className?: string;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({
  onUserSpeech,
  onAIResponse,
  autoReadResponses = true,
  disabled = false,
  className
}) => {
  // State for voice settings
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [autoRead, setAutoRead] = useState<boolean>(autoReadResponses);
  const [showTranscript, setShowTranscript] = useState<boolean>(true);
  const [voiceType, setVoiceType] = useState<'female' | 'male' | 'neutral'>('female');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [speechVolume, setSpeechVolume] = useState<number>(1.0);

  // Enhanced speech to text
  const {
    isListening,
    isSupported: isSTTSupported,
    transcript,
    interimTranscript,
    error: sttError,
    confidence,
    processing: isProcessingSpeech,
    startListening,
    stopListening,
    clearTranscript
  } = useEnhancedSpeechToText({
    continuous: true,
    interimResults: true,
    language: 'en-US'
  });

  // Enhanced text to speech
  const {
    isSpeaking,
    isPaused,
    isSupported: isTTSSupported,
    availableVoices,
    selectedVoice,
    error: ttsError,
    speak,
    speakNow,
    stop: stopSpeaking,
    pause: pauseSpeaking,
    resume: resumeSpeaking,
    selectVoice,
    setRate,
    setPitch,
    setVolume,
    getVoicesByLang
  } = useEnhancedTextToSpeech({
    rate: speechRate,
    pitch: speechPitch,
    volume: speechVolume,
    lang: 'en-US'
  });

  // Initialize voice based on preference
  useEffect(() => {
    if (availableVoices.length > 0) {
      const voices = getVoicesByLang('en', voiceType);
      if (voices.length > 0) {
        selectVoice(voices[0].voiceURI);
      }
    }
  }, [availableVoices, voiceType, getVoicesByLang, selectVoice]);

  // Effect to handle sending transcript to onUserSpeech when user stops speaking
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (transcript && !isListening && !disabled) {
      timer = setTimeout(() => {
        onUserSpeech(transcript);
        clearTranscript();
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [transcript, isListening, onUserSpeech, clearTranscript, disabled]);

  // Update speech settings
  useEffect(() => {
    setRate(speechRate);
    setPitch(speechPitch);
    setVolume(speechVolume);
  }, [speechRate, speechPitch, speechVolume, setRate, setPitch, setVolume]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (disabled) return;
    
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
    }
  }, [isListening, startListening, stopListening, clearTranscript, disabled]);

  // Toggle speaking
  const toggleSpeaking = useCallback(() => {
    if (disabled) return;
    
    if (isSpeaking) {
      if (isPaused) {
        resumeSpeaking();
      } else {
        pauseSpeaking();
      }
    } else {
      stopSpeaking();
    }
  }, [isSpeaking, isPaused, pauseSpeaking, resumeSpeaking, stopSpeaking, disabled]);

  // Handle settings menu
  const handleOpenSettings = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setSettingsAnchorEl(null);
  };

  // Handle voice gender selection
  const handleVoiceTypeChange = (type: 'female' | 'male' | 'neutral') => {
    setVoiceType(type);
    handleCloseSettings();
  };

  // Speak AI response
  const speakResponse = useCallback((text: string) => {
    if (!isTTSSupported || disabled) return;
    
    // Clean text from markdown or HTML if present
    const cleanText = text
      .replace(/```[^`]*```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just their text
      .replace(/#{1,6}\s+(.*)/g, '$1') // Remove heading markers
      .trim();
    
    speakNow(cleanText);
  }, [isTTSSupported, speakNow, disabled]);

  // Provide method to speak AI responses through a ref
  useEffect(() => {
    const handleAIResponseWrapped = async (text: string) => {
      await onAIResponse(text);
      if (autoRead && !disabled) {
        speakResponse(text);
      }
    };

    // This effect exports the wrapped handler via the onAIResponse prop
    onAIResponse = handleAIResponseWrapped;
  }, [autoRead, speakResponse, disabled]);

  // Error handling and support checking
  if (!isSTTSupported || !isTTSSupported) {
    return (
      <Paper className={className} sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography variant="body2">
          Voice control is not supported in your browser. Please try using Chrome, Edge, or Safari.
        </Typography>
      </Paper>
    );
  }

  if (sttError || ttsError) {
    return (
      <Paper className={className} sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
        <Typography variant="body2">
          Voice control error: {sttError?.message || ttsError?.message}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box className={className} sx={{ width: '100%' }}>
      {/* Voice control panel */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          opacity: disabled ? 0.5 : 1,
          transition: 'opacity 0.2s ease-in-out',
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={isListening ? "Stop listening" : "Start listening"}>
            <IconButton 
              color={isListening ? "primary" : "default"} 
              onClick={toggleListening}
              disabled={disabled}
            >
              {isProcessingSpeech ? <CircularProgress size={24} /> : (
                isListening ? <Badge color="error" variant="dot"><MicIcon /></Badge> : <MicOffIcon />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title={isSpeaking ? (isPaused ? "Resume speaking" : "Pause speaking") : "Not speaking"}>
            <IconButton 
              color={isSpeaking ? "primary" : "default"} 
              onClick={toggleSpeaking}
              disabled={disabled || !isSpeaking}
            >
              {isSpeaking ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Voice settings">
            <IconButton 
              onClick={handleOpenSettings}
              disabled={disabled}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* Voice gender indicator */}
          <Tooltip title={`Current voice type: ${voiceType}`}>
            <Chip 
              icon={
                voiceType === 'female' ? <WomanIcon /> : 
                voiceType === 'male' ? <ManIcon /> : 
                <PersonIcon />
              } 
              label={`${voiceType} voice`}
              size="small"
              variant="outlined"
              color={isSpeaking ? "primary" : "default"}
            />
          </Tooltip>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              checked={autoRead}
              onChange={(e) => setAutoRead(e.target.checked)}
              name="autoRead"
              color="primary"
              disabled={disabled}
              size="small"
            />
          }
          label={<Typography variant="caption">Auto-read responses</Typography>}
          sx={{ mr: 0 }}
        />
      </Paper>

      {/* Speech transcript display */}
      {showTranscript && (transcript || interimTranscript) && (
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 1, 
            p: 1.5, 
            backgroundColor: 'primary.light', 
            color: 'primary.contrastText',
            opacity: 0.9,
            borderRadius: 2,
            position: 'relative'
          }}
        >
          <Typography variant="body2" fontWeight={isListening ? 'normal' : 'bold'}>
            {transcript}
            {isListening && (
              <Typography 
                component="span" 
                sx={{ 
                  fontStyle: 'italic', 
                  opacity: 0.7,
                  pl: 0.5
                }}
              >
                {interimTranscript}
              </Typography>
            )}
          </Typography>
          
          {confidence > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                bottom: 2, 
                right: 8,
                opacity: 0.7
              }}
            >
              Confidence: {Math.round(confidence * 100)}%
            </Typography>
          )}
        </Paper>
      )}

      {/* Settings menu */}
      <Menu
        anchorEl={settingsAnchorEl}
        open={Boolean(settingsAnchorEl)}
        onClose={handleCloseSettings}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={() => handleVoiceTypeChange('female')}>
          <WomanIcon sx={{ mr: 1 }} />
          Female voice
          {voiceType === 'female' && <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>✓</Typography>}
        </MenuItem>
        <MenuItem onClick={() => handleVoiceTypeChange('male')}>
          <ManIcon sx={{ mr: 1 }} />
          Male voice
          {voiceType === 'male' && <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>✓</Typography>}
        </MenuItem>
        <MenuItem onClick={() => handleVoiceTypeChange('neutral')}>
          <PersonIcon sx={{ mr: 1 }} />
          Neutral voice
          {voiceType === 'neutral' && <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>✓</Typography>}
        </MenuItem>
        
        <Divider />
        
        <MenuItem>
          <Box sx={{ width: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SpeedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2">Speech Rate: {speechRate.toFixed(1)}x</Typography>
            </Box>
            <Slider
              value={speechRate}
              onChange={(_, value) => setSpeechRate(value as number)}
              min={0.5}
              max={2}
              step={0.1}
              aria-labelledby="speech-rate-slider"
              sx={{ mt: 1 }}
            />
          </Box>
        </MenuItem>
        
        <MenuItem>
          <Box sx={{ width: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TuneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2">Pitch: {speechPitch.toFixed(1)}</Typography>
            </Box>
            <Slider
              value={speechPitch}
              onChange={(_, value) => setSpeechPitch(value as number)}
              min={0.5}
              max={1.5}
              step={0.1}
              aria-labelledby="speech-pitch-slider"
              sx={{ mt: 1 }}
            />
          </Box>
        </MenuItem>
        
        <MenuItem>
          <Box sx={{ width: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VolumeUpIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2">Volume: {Math.round(speechVolume * 100)}%</Typography>
            </Box>
            <Slider
              value={speechVolume}
              onChange={(_, value) => setSpeechVolume(value as number)}
              min={0}
              max={1}
              step={0.1}
              aria-labelledby="speech-volume-slider"
              sx={{ mt: 1 }}
            />
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={showTranscript}
                onChange={(e) => setShowTranscript(e.target.checked)}
                name="showTranscript"
                color="primary"
                size="small"
              />
            }
            label="Show speech transcript"
          />
        </MenuItem>
        
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={autoRead}
                onChange={(e) => setAutoRead(e.target.checked)}
                name="autoRead"
                color="primary"
                size="small"
              />
            }
            label="Auto-read AI responses"
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}; 