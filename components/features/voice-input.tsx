'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  tone?: string;
}

export function VoiceInput({ onTranscript, tone = 'professional' }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micPermission, setMicPermission] = useState<'unknown' | 'requesting' | 'granted' | 'denied'>('unknown');
  const [hasRequestedBefore, setHasRequestedBefore] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check if permission was granted before
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (result.state === 'granted') {
          setMicPermission('granted');
          setHasRequestedBefore(true);
        } else if (result.state === 'denied') {
          setMicPermission('denied');
        }
      } catch (error) {
        // Permission API might not be supported
        console.log('Permission API not supported');
      }
    };
    checkPermission();

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Analyze audio levels
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedLevel = Math.min(100, (average / 128) * 100);

    setAudioLevel(normalizedLevel);

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startRecording = async () => {
    try {
      setMicPermission('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Permission granted
      setMicPermission('granted');
      setHasRequestedBefore(true);

      // Setup audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Start analyzing
      analyzeAudio();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);

        // Stop audio analysis
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        setAudioLevel(0);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

          // Send to backend for transcription + AI polish
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          formData.append('tone', tone);

          const response = await fetch('/api/ai/dictate', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (data.polished) {
            onTranscript(data.polished);
            toast.success('🎤 Voice message transcribed and polished!');
          } else {
            toast.error(data.error || 'Failed to process audio');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Failed to transcribe audio');
        } finally {
          setIsProcessing(false);

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('🎤 Recording... Speak naturally!');
    } catch (error) {
      console.error('Microphone access error:', error);
      setMicPermission('denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <TooltipProvider>
      <div>
        {micPermission === 'requesting' && (
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Requesting microphone access...</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {!hasRequestedBefore && "This is only needed once. Please allow when prompted."}
              </p>
            </div>
          </div>
        )}

        {micPermission === 'denied' && (
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="text-sm">
              <p className="font-medium text-red-900 dark:text-red-100">Microphone access denied</p>
              <p className="text-xs text-red-700 dark:text-red-300">
                Please enable microphone in your browser settings
              </p>
            </div>
          </div>
        )}

        {!isRecording && !isProcessing && micPermission !== 'requesting' && micPermission !== 'denied' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                onClick={startRecording}
              >
                <Mic className="mr-2 h-4 w-4" />
                AI Dictate
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hasRequestedBefore
                ? "Speak naturally and AI will write a perfect email"
                : "Speak naturally and AI will write a perfect email (mic access required once)"
              }
            </TooltipContent>
          </Tooltip>
        )}

        {isRecording && (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={stopRecording}
              className="animate-pulse"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>

            {/* Audio Level Meter */}
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border border-border">
              <Mic className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => {
                  const threshold = (i + 1) * 10;
                  const isActive = audioLevel >= threshold;
                  const color = i < 6 ? 'bg-green-500' : i < 8 ? 'bg-yellow-500' : 'bg-red-500';
                  return (
                    <div
                      key={i}
                      className={`w-1 h-4 rounded-full transition-all duration-75 ${
                        isActive ? color : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                      style={{
                        height: isActive ? `${12 + (i * 2)}px` : '8px',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <Button type="button" variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
