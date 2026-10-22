'use client';

import { useState, useRef, useCallback } from 'react';

export type ESignatureStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'signing'
  | 'signed'
  | 'error';

export interface ESignatureResult {
  certificateSerial: string;
  signerName: string;
  signerCN: string;
  signedAt: number;
  signatureValue: string;
  method: string;
}

const ESIGN_PORTS = [8543, 14500, 9000];
const CONNECT_TIMEOUT_MS = 5000;
const SIGN_TIMEOUT_MS = 120000;

export function useESignature() {
  const [status, setStatus] = useState<ESignatureStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const resultRef = useRef<ESignatureResult | null>(null);
  const statusRef = useRef<ESignatureStatus>('idle');

  const updateStatus = useCallback((s: ESignatureStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
      } catch {}
      wsRef.current = null;
    }
  }, []);

  const tryConnect = useCallback(
    (port: number): Promise<WebSocket> => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error('timeout'));
        }, CONNECT_TIMEOUT_MS);

        try {
          const ws = new WebSocket(`ws://localhost:${port}`);
          wsRef.current = ws;

          ws.onopen = () => {
            clearTimeout(timer);
            resolve(ws);
          };

          ws.onerror = () => {
            clearTimeout(timer);
            cleanup();
            reject(new Error('connection_error'));
          };

          ws.onclose = () => {
            clearTimeout(timer);
            reject(new Error('closed'));
          };
        } catch {
          clearTimeout(timer);
          reject(new Error('exception'));
        }
      });
    },
    [cleanup],
  );

  const signReport = useCallback(
    async (reportData: Record<string, unknown>): Promise<ESignatureResult> => {
      updateStatus('connecting');
      setErrorMsg('');
      resultRef.current = null;

      let connectedWs: WebSocket | null = null;

      for (const port of ESIGN_PORTS) {
        try {
          connectedWs = await tryConnect(port);
          break;
        } catch {
          // try next port
        }
      }

      if (!connectedWs) {
        updateStatus('error');
        setErrorMsg(
          'E-İmza TR uygulamasına bağlanılamadı. Lütfen bilgisayarınızda E-İmza TR uygulamasının açık ve AKİS kartınızın takılı olduğundan emin olun.',
        );
        cleanup();
        throw new Error('no_connection');
      }

      updateStatus('connected');

      return new Promise<ESignatureResult>((resolve, reject) => {
        const ws = connectedWs!;

        const fail = (msg: string) => {
          updateStatus('error');
          setErrorMsg(msg);
          cleanup();
          reject(new Error(msg));
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);

            if (data.status === 'error' || data.error) {
              fail(data.message || data.error || 'İmza işlemi E-İmza TR tarafından reddedildi.');
              return;
            }

            if (data.status === 'signed' || data.signed || data.signature) {
              const result: ESignatureResult = {
                certificateSerial: data.certificateSerial || data.certSerial || data.serial || '',
                signerName: data.signerName || data.cn || '',
                signerCN: data.signerCN || data.subjectCN || '',
                signedAt: Date.now(),
                signatureValue: data.signature || data.signatureValue || data.signedData || '',
                method: 'AKİS (Nitelikli Elektronik Sertifika) — E-İmza TR',
              };
              resultRef.current = result;
              updateStatus('signed');
              cleanup();
              resolve(result);
              return;
            }

            if (data.status === 'waiting' || data.status === 'pin_required') {
              updateStatus('signing');
              return;
            }
          } catch {
            // non-JSON message, ignore
          }
        };

        ws.onerror = () => fail('E-İmza TR bağlantısı kesildi. Lütfen tekrar deneyin.');

        try {
          const payload = JSON.stringify({
            action: 'sign',
            type: 'report',
            data: reportData,
            format: 'CAdES',
            hashAlgorithm: 'SHA-256',
          });
          ws.send(payload);
          updateStatus('signing');
        } catch {
          fail('İmza verisi E-İmza TR uygulamasına gönderilemedi.');
        }

        setTimeout(() => {
          if (statusRef.current !== 'signed') {
            fail('İmza işlemi zaman aşımına uğradı. AKİS kart PIN kodunu girdiğinizden emin olun.');
          }
        }, SIGN_TIMEOUT_MS);
      });
    },
    [cleanup, tryConnect, updateStatus],
  );

  const reset = useCallback(() => {
    updateStatus('idle');
    setErrorMsg('');
    resultRef.current = null;
    cleanup();
  }, [cleanup, updateStatus]);

  return { status, errorMsg, signReport, reset };
}
