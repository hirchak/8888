'use client';
import { useState, useRef } from 'react';

export default function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const start = () => {
    setError(null);
    
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Твій браузер не підтримує розпізнавання мови. Спробуй Chrome або Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'uk-UA';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    let finalTranscript = '';
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript && interimTranscript) {
        onTranscript(finalTranscript + interimTranscript);
      } else if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setError('Мова не виявлена. Спробуй ще раз.');
      } else if (event.error === 'not-allowed') {
        setError('Доступ до мікрофона заблоковано. Дозволь доступ в налаштуваннях браузера.');
      } else {
        setError('Помилка: ' + event.error);
      }
      setRecording(false);
    };
    
    recognition.onend = () => {
      if (recording) {
        // Restart if still recording
        try {
          recognition.start();
        } catch {
          setRecording(false);
        }
      }
    };
    
    try {
      recognition.start();
      setRecording(true);
    } catch (err) {
      setError('Не вдалося запустити запис.');
    }
  };

  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
    }
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
            🎤 Записати
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-red-400 text-sm text-center max-w-xs">{error}</p>
      )}
      
      {recording && (
        <p className="text-cyan-400 text-sm animate-pulse">🎙 Говори українською...</p>
      )}
    </div>
  );
}
