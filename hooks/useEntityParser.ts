'use client';
import { useState } from 'react';

interface ParsedEntity {
  type: 'people' | 'project' | 'idea' | 'opportunity';
  name: string;
  confidence: number;
}

export function useEntityParser() {
  const [proposal, setProposal] = useState<ParsedEntity[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');

  const parse = async (text: string) => {
    setLoading(true);
    setRawText(text);
    const res = await fetch('/api/parse-entities', {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    setProposal(data.entities);
    setLoading(false);
  };

  const reset = () => { setProposal(null); setRawText(''); };

  return { proposal, loading, rawText, parse, reset };
}
