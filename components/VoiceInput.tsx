'use client';
import { useState, useRef } from 'react';

export default function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Fallback mime types
      const mimeType = MediaRecorder.isTypeSupported('audio/ogg') 
        ? 'audio/ogg' 
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.current = recorder;
      chunks.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        setLoading(true);
        
        const blob = new Blob(chunks.current, { type: mimeType });
        const formData = new FormData();
        formData.append('audio', blob, `voice.${mimeType.split('/')[1]}`);
        
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          const data = await res.json();
          setLoading(false);
          if (data.text) {
            onTranscript(data.text);
          } else {
            setError('Текст не розпізнано. Спробуй ще раз.');
          }
        } catch (err) {
          setLoading(false);
          setError('Помилка транскрипції.');
        }
      };
      
      recorder.onerror = (e) => {
        setError('Помилка запису: ' + e);
        setRecording(false);
      };
      
      recorder.start(1000); // collect data every second
      setRecording(true);
    } catch (err) {
      setError('Не вдалося отримати доступ до мікрофона.');
    }
  };

  const stop = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
    }
    setRecording(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {recording ? (
          <button onClick={stop} className="btn-primary flex items-center gap-2 px-6 py-3">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Зупинити
          </button>
        ) : (
          <button onClick={start} disabled={loading} className="btn-secondary flex items-center gap-2 px-6 py-3 text-base">
            {loading ? '⏳ Обробка...' : '🎤 Записати'}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      
      {recording && (
        <p className="text-cyan-400 text-sm animate-pulse">🎙 Говори...</p>
      )}
    </div>
  );
}
