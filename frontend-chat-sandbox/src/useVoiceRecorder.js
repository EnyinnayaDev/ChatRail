import { useRef, useState, useCallback } from "react";

/**
 * Voice note recorder using MediaRecorder.
 * Gracefully falls back if the browser blocks mic access.
 */
export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording not supported in this browser.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data && e.data.size > 0 && chunksRef.current.push(e.data);
      mr.start();
      setRecording(true);
      return true;
    } catch (e) {
      setError("Microphone permission denied — type your order instead.");
      return false;
    }
  }, []);

  const stop = useCallback(() => new Promise((resolve) => {
    const mr = mediaRef.current;
    if (!mr) return resolve(null);
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
      const buf = await blob.arrayBuffer();
      // base64
      let bin = ""; const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      const b64 = btoa(bin);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setRecording(false);
      resolve({ base64: b64, mime: blob.type, blob, url: URL.createObjectURL(blob) });
    };
    mr.stop();
  }), []);

  return { recording, error, start, stop };
}
