/**
 * The home page for the application. It renders a simple heading to verify
 * that routing is working.
 */
// Because this component uses React state and event handlers, mark it as a
// client component. Without this directive, Next.js will treat the page as a
// server component and building will fail. See the Next.js App Router docs for
// details.
"use client";

import { useState } from 'react';

/**
 * The home page for the application. It renders a simple interface for
 * interacting with the SeedSIM API. Users can paste a scenario description
 * into the textarea and click “Parse” to send it to the `/api/seedsim/parse`
 * endpoint. The stub response from the server is displayed below the form.
 */
export default function HomePage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleParse() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/seedsim/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>SeedSIM Studio</h1>
      <p>Enter a scenario description below and click <strong>Parse</strong> to see the stub response.</p>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your simulation scenario here..."
        rows={6}
        style={{ width: '100%', padding: '0.5rem', fontFamily: 'inherit' }}
      />
      <button
        onClick={handleParse}
        disabled={loading || !input.trim()}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
      >
        {loading ? 'Parsing...' : 'Parse'}
      </button>
      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</p>
      )}
      {result && (
        <pre
          style={{
            marginTop: '1rem',
            background: '#f6f6f6',
            padding: '1rem',
            borderRadius: '4px',
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}