import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

interface IdentificationMessage {
  scanResult?: string;
  statusReason?: string;
  statusDetails?: string;
  signingResult?: string;
  signingErrors?: string;
  date?: number | string;
  [key: string]: unknown;
}

function App() {
  const [autoIdURL, setAutoIdURL] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('startUrl') || '';
  });
  const [scanResult, setScanResult] = useState<string>('NO_STATUS');
  const [statusReason, setStatusReason] = useState<string>('');
  const [statusDetails, setStatusDetails] = useState<string>('');
  const [signingResult, setSigningResult] = useState<string>('');
  const [signingErrors, setSigningErrors] = useState<string>('');
  const [messageTime, setMessageTime] = useState<string>('');
  const [rawMessage, setRawMessage] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  // const allowedOrigins = useMemo(() => [
  //   'mideal-dev.okd4.dev.mesoneer.io',
  //   'mideal-stg.okd4.dev.mesoneer.io',  
  //   'id-validation.ch'
  // ], []);

  // const dynamicOrigin = useMemo(() => {
  //   try {
  //     const u = new URL(autoIdURL);
  //     return u.hostname || '';
  //   } catch {
  //     return '';
  //   }
  // }, [autoIdURL]);

  const log = useCallback((level: 'log' | 'warn' | 'error', tag: string, msg: string, extra?: unknown) => {
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${tag}] ${msg}`;
    setLogs(prev => [...prev, line]);
    // eslint-disable-next-line no-console
    console[level](line, extra ?? '');
  }, []);

  const handleEvent = useCallback((data: IdentificationMessage) => {
    setScanResult(data.scanResult ?? 'NO_STATUS');
    setStatusReason(data.statusReason ?? '');
    setStatusDetails(data.statusDetails ?? '');
    setSigningResult(data.signingResult ?? '');
    setSigningErrors(data.signingErrors ?? '');
    const dt = data.date ? String(data.date) : '';
    setMessageTime(dt);
  }, []);

  const messageListener = useCallback((event: MessageEvent) => {

    if (
      !event.origin.includes('ubiid.ch') &&
      !event.origin.includes('mideal-stg.okd4.dev.mesoneer.io')) {
      log('log', 'AutoIdent.tsx', 'Ignore message event from invalid origin', event.origin);
      return;
    } else {
      log('log', 'AutoIdent.tsx', 'Received event from supported origin!', event.origin);
    }

    log('log', 'AutoIdent.tsx', 'AUTOID EVENT RECEIVED!', event);

    try {
      let parsed = JSON.parse(event.data);

      setRawMessage(() => {
        try {
          return JSON.stringify(event.data, null, 2);
        } catch {
          return event.data;
        }
      });

      log('log', 'AutoIdent.tsx', 'AUTOID EVENT data parsed!', parsed);

      // Some environments require a small delay before handling the result
      setTimeout(() => {
        handleEvent(parsed as IdentificationMessage);
      }, 1000);

    } catch (syntaxError) {
      log('log', 'AutoIdent.tsx', 'Parsing event.data to JSON failed!', syntaxError);
    }

  }, [handleEvent, log]);

  useEffect(() => {
    window.addEventListener('message', messageListener, false);
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [messageListener]);

  const clearResults = useCallback(() => {
    setScanResult('NO_STATUS');
    setStatusReason('');
    setStatusDetails('');
    setSigningResult('');
    setSigningErrors('');
    setMessageTime('');
    setRawMessage('');
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: 'auto', padding: 24 }}>
        <h2>m_IDeal embedding (React, iframe + postMessage)</h2>
        <p>
          Paste the start URL returned by the m_IDeal public API (scheduled case), then load it in the iframe below.
        </p>
        <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', textAlign: 'left' }}>
          <label htmlFor="startUrl"><strong>Start URL:</strong></label>
          <input
            id="startUrl"
            type="text"
            placeholder="https://ubiid.ubitec.io/scan/start?tenantid=..."
            value={autoIdURL}
            onChange={(e) => setAutoIdURL(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', marginTop: 8, marginBottom: 12 }}
          />
        </div>
      </header>

      <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', textAlign: 'left' }}>
        <div style={{ marginBottom: 12 }}>
          <button onClick={clearResults} style={{ marginRight: 8 }}>Clear results</button>
          <button onClick={clearLogs}>Clear logs</button>
        </div>

        <div style={{ border: '1px solid #444', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          <h3>Embedded frame</h3>
          {autoIdURL ? (
            <iframe
              id="ubiid-embedded"
              title="Autoident process"
              src={autoIdURL}
              allow="camera;microphone"
              allowFullScreen={true}
              style={{ width: '100%', height: 860, border: '1px solid #666', borderRadius: 4 }}
            />
          ) : (
            <div style={{ padding: 12, color: '#888' }}>Enter a valid start URL to load the iframe.</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ border: '1px solid #444', padding: 12, borderRadius: 6 }}>
            <h3>Received message (parsed)</h3>
            <div><strong>scanResult:</strong> {scanResult}</div>
            <div><strong>statusReason:</strong> {statusReason}</div>
            <div><strong>statusDetails:</strong> {statusDetails}</div>
            <div><strong>signingResult:</strong> {signingResult || '-'}</div>
            <div><strong>signingErrors:</strong> {signingErrors || '-'}</div>
            <div><strong>date/time:</strong> {messageTime || '-'}</div>
          </div>
          <div style={{ border: '1px solid #444', padding: 12, borderRadius: 6 }}>
            <h3>Raw message payload</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{rawMessage || '(no message yet)'}</pre>
          </div>
        </div>

        <div style={{ border: '1px solid #444', padding: 12, borderRadius: 6, marginTop: 16 }}>
          <h3>Debug logs</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {logs.length ? logs.join('\n') : '(no logs yet)'}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
