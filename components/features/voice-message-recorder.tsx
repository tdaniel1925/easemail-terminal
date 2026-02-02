'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Play, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceMessageRecorderProps {
  onRecorded: (audioBlob: Blob, duration: number) => void;
}

export function VoiceMessageRecorder({ onRecorded }: VoiceMessageRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Stop stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('🎤 Recording voice message...');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Please allow microphone access');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioURL && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const deleteRecording = () => {
    setAudioURL(null);
    setAudioBlob(null);
    setDuration(0);
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  const attachRecording = () => {
    if (audioBlob) {
      onRecorded(audioBlob, duration);
      toast.success('🔊 Voice message attached!');
      deleteRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      {!audioURL && (
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button
              type="button"
              variant="outline"
              onClick={startRecording}
            >
              <Mic className="mr-2 h-4 w-4" />
              Record Voice Message
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="destructive"
                onClick={stopRecording}
                className="animate-pulse"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
              <Badge variant="destructive" className="animate-pulse">
                {formatDuration(duration)}
              </Badge>
            </>
          )}
        </div>
      )}

      {/* Playback Controls */}
      {audioURL && (
        <div className="flex items-center gap-2 p-4 border border-border rounded-lg">
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={handleAudioEnded}
            className="hidden"
          />

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={playAudio}
            disabled={isPlaying}
          >
            <Play className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Voice Message</span>
              <Badge variant="secondary">{formatDuration(duration)}</Badge>
            </div>
            <div className="h-1 bg-muted rounded-full mt-2">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: isPlaying ? '100%' : '0%' }}
              />
            </div>
          </div>

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={deleteRecording}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            onClick={attachRecording}
          >
            Attach to Email
          </Button>
        </div>
      )}
    </div>
  );
}
