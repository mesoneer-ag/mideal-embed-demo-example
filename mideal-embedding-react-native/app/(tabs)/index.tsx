import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, TextInput, Button } from 'react-native';
import { WebView } from 'react-native-webview';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const [autoIdURL, setAutoIdURL] = React.useState<string>('');
  const [currentHost, setCurrentHost] = React.useState<string>('');
  const [scanResult, setScanResult] = React.useState<string>('NO_STATUS');
  const [statusReason, setStatusReason] = React.useState<string>('');
  const [statusDetails, setStatusDetails] = React.useState<string>('');
  const [signingResult, setSigningResult] = React.useState<string>('');
  const [signingErrors, setSigningErrors] = React.useState<string>('');
  const [messageTime, setMessageTime] = React.useState<string>('');
  const [rawMessage, setRawMessage] = React.useState<string>('');
  const [logs, setLogs] = React.useState<string[]>([]);

  const allowedOrigins = React.useMemo(() => [
    'mideal-dev.okd4.dev.mesoneer.io',
    'mideal-stg.okd4.dev.mesoneer.io',
    'id-validation.ch',
  ], []);

  const log = React.useCallback((level: 'log' | 'warn' | 'error', tag: string, msg: string, extra?: unknown) => {
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${tag}] ${msg}`;
    setLogs(prev => [...prev, line]);
    // eslint-disable-next-line no-console
    // @ts-ignore
    console[level](line, extra ?? '');
  }, []);

  const clearResults = React.useCallback(() => {
    setScanResult('NO_STATUS');
    setStatusReason('');
    setStatusDetails('');
    setSigningResult('');
    setSigningErrors('');
    setMessageTime('');
    setRawMessage('');
  }, []);

  const clearLogs = React.useCallback(() => setLogs([]), []);

  const handleEvent = React.useCallback((data: any) => {
    setScanResult(data?.scanResult ?? 'NO_STATUS');
    setStatusReason(data?.statusReason ?? '');
    setStatusDetails(data?.statusDetails ?? '');
    setSigningResult(data?.signingResult ?? '');
    setSigningErrors(data?.signingErrors ?? '');
    const dt = data?.date ? String(data.date) : '';
    setMessageTime(dt);
  }, []);

  // Bridge window.postMessage -> ReactNativeWebView.postMessage for sites that use browser postMessage API
  const injectedBridge = `
    (function() {
      try {
        function forwardMessage(event) {
          try {
            var data = event && event.data !== undefined ? event.data : null;
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              // Ensure we stringify to keep a consistent format
              var payload = (typeof data === 'string') ? data : JSON.stringify(data);
              window.ReactNativeWebView.postMessage(payload);
            }
          } catch (e) {
            try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage('{"bridgeError":"' + String(e) + '"}'); } catch (_) {}
          }
        }
        window.addEventListener('message', forwardMessage, true);
      } catch (e) {
        try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage('{"bridgeInitError":"' + String(e) + '"}'); } catch (_) {}
      }
    })();
    true; // Required for the script to evaluate on Android
  `;

  const onWebViewMessage = React.useCallback((event: any) => {
    const dataStr: string = event?.nativeEvent?.data ?? '';
    log('log', 'AutoIdent', 'WEBVIEW MESSAGE RECEIVED', dataStr);

    // Basic origin/host verification: only accept when current host matches allowed list
    const hostOk = currentHost && ([currentHost, ...allowedOrigins].some(dom => dom && currentHost.includes(dom)));
    if (!hostOk) {
      log('warn', 'AutoIdent', `Ignored message due to untrusted host: ${currentHost}`);
      return;
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(dataStr);
    } catch {
      // When not JSON, still surface raw
      parsed = { raw: dataStr };
    }

    try {
      setRawMessage(JSON.stringify(parsed, null, 2));
    } catch {
      setRawMessage(String(dataStr));
    }

    // Delay to align with web demo behavior
    setTimeout(() => handleEvent(parsed), 1000);
  }, [allowedOrigins, currentHost, handleEvent, log]);

  const onNavChange = React.useCallback((navState: any) => {
    try {
      const url: string = navState?.url || '';
      if (url) {
        const { hostname } = new URL(url);
        setCurrentHost(hostname);
      }
    } catch {}
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">m_IDeal embedding (React Native, WebView + postMessage)</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold">Start URL</ThemedText>
        <ThemedText style={{ color: '#888', marginTop: 4 }}>
          Paste the start URL returned by the m_IDeal public API (scheduled case), then load it below.
        </ThemedText>
        <TextInput
          placeholder="https://ubiid.ubitec.io/scan/start?tenantid=..."
          value={autoIdURL}
          onChangeText={setAutoIdURL}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={{
            borderWidth: 1,
            borderColor: '#666',
            borderRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginTop: 8,
          }}
        />
        <ThemedView style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Button title="Clear results" onPress={clearResults} />
          <Button title="Clear logs" onPress={clearLogs} />
        </ThemedView>
      </ThemedView>

      {/* Instead of a complex form, render a simple WebView when URL present */}
      <ThemedView style={styles.section}>
        {autoIdURL ? (
          // @ts-ignore - WebView type provided by react-native-webview
          <WebView
            source={{ uri: autoIdURL }}
            onMessage={onWebViewMessage}
            onNavigationStateChange={onNavChange}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            injectedJavaScript={injectedBridge}
            injectedJavaScriptBeforeContentLoaded={injectedBridge}
            style={{ height: 860, borderWidth: 1, borderColor: '#666', borderRadius: 4 }}
          />
        ) : (
          <ThemedText style={{ color: '#888' }}>Enter a valid start URL to load the WebView.</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={{ gap: 12, marginBottom: 16 }}>
        <ThemedText type="subtitle">Received message (parsed)</ThemedText>
        <ThemedText>scanResult: {scanResult}</ThemedText>
        <ThemedText>statusReason: {statusReason}</ThemedText>
        <ThemedText>statusDetails: {statusDetails}</ThemedText>
        <ThemedText>signingResult: {signingResult || '-'}</ThemedText>
        <ThemedText>signingErrors: {signingErrors || '-'}</ThemedText>
        <ThemedText>date/time: {messageTime || '-'}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Raw message payload</ThemedText>
        <ThemedText>{rawMessage || '(no message yet)'}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Debug logs</ThemedText>
        <ThemedText>{logs.length ? logs.join('\n') : '(no logs yet)'}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
