'use client';

import { useState } from 'react';

export default function TestPage() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Generate a simple flowchart diagram' }],
          config: {
            provider: 'custom',
            apiKey: 'test',
            model: 'custom',
            temperature: 0.3,
            maxTokens: 1000,
          },
        }),
      });

      if (res.ok) {
        const text = await res.text();
        setResponse(text);
      } else {
        setResponse(`Error: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI API Test</h1>
      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Response:</h2>
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  );
} 