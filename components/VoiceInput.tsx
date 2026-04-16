'use client';
import { useState, useRef } from 'react';

export default function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/ogg' });
    mediaRecorder.current = recorder;
    chunks.current = [];
    recorder.ondataavailable = (e) => chunks.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/ogg' });
      setLoading(true);
      const formData = new FormData();
      formData.append('audio', blob, 'voice.ogg');
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      setLoading(false);
      if (data.text) onTranscript(data.text);
    };
    recorder.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <button onClick={stop} className="btn-primary flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Зупинити
        </button>
      ) : (
        <button onClick={start} disabled={loading} className="btn-secondary flex items-center gap-2">
          {loading ? '⏳ Транскрибація...' : '🎤 Записати'}
        </button>
      )}
    </div>
  );
}
