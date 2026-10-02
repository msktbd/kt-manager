import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

const BUILD = {
  number: String(import.meta.env.VITE_BUILD_NUMBER ?? 'dev'),
  commit: String(import.meta.env.VITE_COMMIT_SHA ?? 'local').slice(0, 7),
  time: String(import.meta.env.VITE_BUILD_TIME ?? 'unknown'),
};

const KEY_MARKER = 'kt_spike_marker';
const KEY_LAUNCHES = 'kt_spike_launches';

type Marker = { writtenAt: string; writtenInBuild: string };

function loadMarker(): Marker | null {
  try {
    const raw = localStorage.getItem(KEY_MARKER);
    return raw ? (JSON.parse(raw) as Marker) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [launches] = useState(() => {
    const n = Number(localStorage.getItem(KEY_LAUNCHES) ?? '0') + 1;
    localStorage.setItem(KEY_LAUNCHES, String(n));
    return n;
  });
  const [marker, setMarker] = useState<Marker | null>(loadMarker);
  const [deviceInfo, setDeviceInfo] = useState('অপেক্ষা…');

  useEffect(() => {
    const uad = (navigator as any).userAgentData;
    if (!uad?.getHighEntropyValues) {
      setDeviceInfo('অনুপলব্ধ');
      return;
    }
    uad
      .getHighEntropyValues(['platformVersion', 'model'])
      .then((v: any) =>
        setDeviceInfo(`Android ${v.platformVersion ?? '?'} · ${v.model || 'মডেল অজানা'}`),
      )
      .catch(() => setDeviceInfo('অনুপলব্ধ'));
  }, []);

  function writeMarker() {
    const m: Marker = {
      writtenAt: new Date().toISOString(),
      writtenInBuild: BUILD.number,
    };
    localStorage.setItem(KEY_MARKER, JSON.stringify(m));
    setMarker(m);
  }

  function clearMarker() {
    localStorage.removeItem(KEY_MARKER);
    setMarker(null);
  }

  return (
    <main className="wrap">
      <h1>KT Spike · S0</h1>

      <section>
        <h2>Build</h2>
        <p>Build নম্বর: <b>#{BUILD.number}</b></p>
        <p>Commit: <b>{BUILD.commit}</b></p>
        <p>Build সময় (UTC): {BUILD.time}</p>
      </section>

      <section>
        <h2>অ্যাপ</h2>
        <p>Native অ্যাপ: <b>{Capacitor.isNativePlatform() ? 'হ্যাঁ' : 'না'}</b></p>
        <p>Platform: {Capacitor.getPlatform()}</p>
        <p>এই ইনস্টলে খোলার সংখ্যা: <b>{launches}</b></p>
        <p>বাংলা পরীক্ষা: ট্রাক, মিল, বিক্রেতা, অর্ডার ১২৩৪৫</p>
      </section>

      <section>
        <h2>ডিভাইস (সম্ভাব্য)</h2>
        <p>{deviceInfo}</p>
        <p>স্ক্রিন: {window.innerWidth}×{window.innerHeight} · ভাষা: {navigator.language}</p>
      </section>

      <section>
        <h2>Update পরীক্ষা</h2>
        {marker ? (
          <p>
            Marker আছে ✅ — লেখা হয়েছিল Build <b>#{marker.writtenInBuild}</b>-এ ({marker.writtenAt}).
            এখন চলছে Build <b>#{BUILD.number}</b>.
          </p>
        ) : (
          <p>কোনো marker নেই।</p>
        )}
        <div className="row">
          <button onClick={writeMarker}>Marker লিখুন</button>
          <button className="ghost" onClick={clearMarker}>মুছুন</button>
        </div>
        <p className="hint">
          ধাপ: Build #A-তে marker লিখুন → Build #B ওপরে install করুন → marker এখনো থাকলে PASS।
        </p>
      </section>
    </main>
  );
}
