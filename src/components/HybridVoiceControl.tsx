import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Badge, CircularProgress, Menu, MenuItem, Typography, Switch, FormControlLabel, Slider, Divider } from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Settings as SettingsIcon,
  Woman as WomanIcon,
  Man as ManIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  StarRounded as PremiumIcon,
  ErrorOutline as ErrorIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';

// Interface for component props
interface HybridVoiceControlProps {
  onUserSpeech: (text: string) => void;
  onToggleListen: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  isPremiumActive: boolean;
  isLoading: boolean;
  error?: string | null;
  premiumVoiceUsed: number;
  premiumVoiceQuota: number;
  onVoiceTypeChange: (type: 'male' | 'female' | 'neutral') => void;
  onRateChange: (rate: number) => void;
  voiceType: 'male' | 'female' | 'neutral';
  speechRate: number;
  onStop: () => void;
  className?: string;
  transcript?: string;
  interimTranscript?: string;
}

export const HybridVoiceControl: React.FC<HybridVoiceControlProps> = ({
  onUserSpeech,
  onToggleListen,
  isListening,
  isSpeaking,
  isPremiumActive,
  isLoading,
  error,
  premiumVoiceUsed,
  premiumVoiceQuota,
  onVoiceTypeChange,
  onRateChange,
  voiceType,
  speechRate,
  onStop,
  className,
  transcript,
  interimTranscript
}) => {
  // State for menu
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(true);
  
  // Handle settings menu
  const handleOpenSettings = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setSettingsAnchorEl(null);
  };
  
  // Calculate premium usage percentage
  const premiumUsagePercent = Math.min(100, Math.round((premiumVoiceUsed / premiumVoiceQuota) * 100));
  
  return (
    <Box className={className} sx={{ width: '100%' }}>
      {/* Voice control panel */}
      <Box 
        sx={{ 
          p: 1, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: 'background.paper',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isListening ? "Stop listening" : "Start listening"}>
            <IconButton 
              color={isListening ? "primary" : "default"} 
              onClick={onToggleListen}
              size="medium"
            >
              {isListening ? <Badge color="error" variant="dot"><MicIcon /></Badge> : <MicOffIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isSpeaking ? "Stop speaking" : "Voice inactive"}>
            <IconButton 
              color={isSpeaking ? "primary" : "default"} 
              onClick={onStop}
              disabled={!isSpeaking}
              size="medium"
            >
              {isSpeaking ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Voice settings">
            <IconButton onClick={handleOpenSettings} size="medium">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          {/* Voice type indicator */}
          <Chip 
            icon={
              voiceType === 'female' ? <WomanIcon /> : 
              voiceType === 'male' ? <ManIcon /> : 
              <PersonIcon />
            } 
            label={voiceType}
            size="small"
            color={isSpeaking ? "primary" : "default"}
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Loading indicator */}
          {isLoading && (
            <CircularProgress size={24} color="secondary" />
          )}
          
          {/* Premium voice indicator */}
          <Tooltip title={`Premium voice: ${premiumVoiceUsed}/${premiumVoiceQuota} uses this month`}>
            <Chip
              icon={<PremiumIcon />}
              label={`${premiumUsagePercent}%`}
              size="small"
              color={isPremiumActive ? "success" : "default"}
              variant={isPremiumActive ? "filled" : "outlined"}
            />
          </Tooltip>
          
          {/* Error indicator */}
          {error && (
            <Tooltip title={error}>
              <Chip
                icon={<ErrorIcon />}
                label="Error"
                size="small"
                color="error"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {/* Speech transcript display */}
      {showTranscript && (transcript || interimTranscript) && (
        <Box 
          sx={{ 
            mt: 1, 
            p: 1.5, 
            backgroundColor: 'primary.light', 
            color: 'primary.contrastText',
            opacity: 0.9,
            borderRadius: '8px',
            position: 'relative'
          }}
        >
          <Typography variant="body2" fontWeight={isListening ? 'normal' : 'bold'}>
            {transcript}
            {isListening && interimTranscript && (
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
        </Box>
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
        <MenuItem onClick={() => { onVoiceTypeChange('female'); handleCloseSettings(); }}>
          <WomanIcon sx={{ mr: 1 }} />
          Female voice
          {voiceType === 'female' && <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>✓</Typography>}
        </MenuItem>
        <MenuItem onClick={() => { onVoiceTypeChange('male'); handleCloseSettings(); }}>
          <ManIcon sx={{ mr: 1 }} />
          Male voice
          {voiceType === 'male' && <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>✓</Typography>}
        </MenuItem>
        <MenuItem onClick={() => { onVoiceTypeChange('neutral'); handleCloseSettings(); }}>
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
              onChange={(_, value) => onRateChange(value as number)}
              min={0.5}
              max={2}
              step={0.1}
              aria-labelledby="speech-rate-slider"
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
        
        {/* Premium voice usage info */}
        <MenuItem disabled>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Premium voice quota: {premiumVoiceUsed}/{premiumVoiceQuota}
            </Typography>
            <Box 
              sx={{ 
                width: '100%', 
                height: 4, 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                mt: 1,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${premiumUsagePercent}%`,
                  bgcolor: premiumUsagePercent > 90 ? 'error.main' : 'success.main',
                  borderRadius: 2
                }}
              />
            </Box>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
}; 