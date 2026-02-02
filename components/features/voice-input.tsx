'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  tone?: string;
}

export function VoiceInput({ onTranscript, tone = 'professional' }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      toast.error('Please allow microphone access');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      {!isRecording && !isProcessing && (
        <Button
          type="button"
          variant="outline"
          onClick={startRecording}
        >
          <Mic className="mr-2 h-4 w-4" />
          AI Dictate
        </Button>
      )}

      {isRecording && (
        <Button
          type="button"
          variant="destructive"
          onClick={stopRecording}
          className="animate-pulse"
        >
          <Square className="mr-2 h-4 w-4" />
          Stop Recording
        </Button>
      )}

      {isProcessing && (
        <Button type="button" variant="outline" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </Button>
      )}
    </div>
  );
}
