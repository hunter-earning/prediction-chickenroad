import './style.css'
import './wingo.css'
import React, { useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'

// Fix mobile viewport height for full-screen layouts (accounts for browser UI)
function setViewportHeightVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setViewportHeightVar();
window.addEventListener('resize', setViewportHeightVar);
window.addEventListener('orientationchange', setViewportHeightVar);

// External links for each app logo
const LINKS = {
  master: 'https://cp7.me/BU5KID/g5w3de0',
  gold: 'https://tg2.my/BU5KIE/g5w3de0',
  masterOld: 'https://tp5.my/BUNJM3/g5w3de0',
  goldOld: 'https://tp3.us/BUNLCX/g5w3de0',
};

function App() {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [view, setView] = useState<'landing' | 'home' | 'setup' | 'plan' | 'tool'>('landing')
  const [selectedApp, setSelectedApp] = useState<keyof typeof LINKS | null>(null);
  const [gameId, setGameId] = useState('');
  const isValid = !!selectedApp && /^\d{6,}$/.test(gameId);
  const openLink = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
  
  // Plan activation states
  const [txnId, setTxnId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  // New: Tool gate state
  const [enteredKey, setEnteredKey] = useState('');
  const [toolAuthorized, setToolAuthorized] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({ amount: '500', date: '', time: '' });
  const [historyInfo, setHistoryInfo] = useState({ amount: '500', date: '', time: '' });
  const [paymentShot, setPaymentShot] = useState<string | null>(null);
  const [historyShot, setHistoryShot] = useState<string | null>(null);

  // Simplified flow: no manual edit UI. Verification happens directly on submit.
  // Extraction confirmation UI removed per requirement

  const amountsMatch = !!paymentInfo.amount && !!historyInfo.amount && paymentInfo.amount.trim() === historyInfo.amount.trim();
  const datesMatch = !!paymentInfo.date && !!historyInfo.date && paymentInfo.date.trim() === historyInfo.date.trim();
  const timesMatch = !!paymentInfo.time && !!historyInfo.time && paymentInfo.time.trim() === historyInfo.time.trim();
  const amountIs500 = ['500', '₹500', '500.00'].includes(paymentInfo.amount.trim()) && ['500', '₹500', '500.00'].includes(historyInfo.amount.trim());
  const canComplete = !!paymentShot && !!historyShot;

  const readImage = (file: File, setter: (v: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) setter(String(e.target.result)); };
    reader.readAsDataURL(file);
  };

  const [resultOpen, setResultOpen] = useState(false);
  const [resultData, setResultData] = useState<{ ok: boolean; key?: string; reason?: string } | null>(null);

  // Tool: game selection inside Prediction Tool
  const [selectedToolGame, setSelectedToolGame] = useState<'aviator'|'chicken'|'wingo'|null>(null);
  // Aviator states
  const aviatorVideoRef = useRef<HTMLVideoElement | null>(null);
  const [aviatorMultiplier, setAviatorMultiplier] = useState(0.01);
  const [aviatorAnimating, setAviatorAnimating] = useState(false);
  const aviatorMax = 10;

  function pickAviatorTarget() {
    const r = Math.random();
    if (r < 0.50) { // 50% below 2.50x
      return 1.45 + Math.random() * (2.5 - 1.45);
    } else if (r < 0.80) { // next 30% between 2.50x and 3.50x
      return 2.5 + Math.random() * (3.5 - 2.5);
    } else if (r < 0.95) { // next 15% between 3.50x and 5x
      return 3.5 + Math.random() * (5 - 3.5);
    } else { // last 5% up to 10x
      return 5 + Math.random() * (aviatorMax - 5);
    }
  }

  function startAviatorPredict() {
    // Reset and start video playback
    setAviatorAnimating(true);
    setAviatorMultiplier(0.01);
    const target = Math.min(pickAviatorTarget(), aviatorMax);
    const video = aviatorVideoRef.current;
    try { video?.play(); } catch {}
    const start = performance.now();
    const duration = 3000; // 3s rise to target
    function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const current = 0.01 + (target - 0.01) * easeOutCubic(t);
      setAviatorMultiplier(parseFloat(current.toFixed(2)));
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setAviatorMultiplier(parseFloat(target.toFixed(2)));
        setAviatorAnimating(false);
      }
    }
    requestAnimationFrame(tick);
  }

  

  // Convert DataURL to Blob locally to avoid network fetch on data: URLs
  const dataURLtoBlob = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const b64 = parts[1];
    const binary = atob(b64);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return new Blob([u8], { type: mime });
  };

  // Manual extraction step removed per requirement. Verification uses backend OCR directly on submit.

  // Wingo states and logic (inside App component)
  const [wingoPattern, setWingoPattern] = useState<Array<'red'|'green'|'purple'>>([]);
  const [wingoOutput, setWingoOutput] = useState<'red'|'green'|'purple'|null>(null);
  const [wingoAnimating, setWingoAnimating] = useState(false);
// Chicken Road states
const [chickenMode, setChickenMode] = useState<'easy'|'medium'|'hard'|'hardcore'>('easy');
const [chickenAnimating, setChickenAnimating] = useState(false);
const [chickenOutput, setChickenOutput] = useState<number|null>(null);
const [chickenPulsing, setChickenPulsing] = useState(false);
// Chicken Road multipliers and mechanics (favor lower multipliers)
const CHICKEN_MULTS = {
  easy: [1.01, 1.03, 1.06, 1.1, 1.15, 1.19, 1.24, 1.3, 1.35, 1.42, 1.48, 1.56, 1.65, 1.75, 1.85, 1.98, 2.12, 2.28, 2.47, 2.7, 2.96, 3.28],
  medium: [1.08, 1.21, 1.37, 1.56, 1.78, 2.05, 2.37, 2.77, 3.24, 3.85, 4.62, 5.61],
  hard: [1.18, 1.46, 1.83, 2.31, 2.95, 3.82],
  hardcore: [1.44, 2.21, 3.45, 5.53],
} as const;
function pickChickenMultiplier(mode: 'easy'|'medium'|'hard'|'hardcore') {
  const arr = CHICKEN_MULTS[mode];
  const n = arr.length;
  const weights = arr.map((_, i) => Math.pow(n - i, 2));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < n; i++) {
    if (r < weights[i]) return arr[i];
    r -= weights[i];
  }
  return arr[0];
}
function startChickenPredict() {
  setChickenAnimating(true);
  setChickenOutput(null);
  setTimeout(() => {
    const m = pickChickenMultiplier(chickenMode);
    setChickenOutput(m);
    setChickenAnimating(false);
    setChickenPulsing(true);
    setTimeout(() => setChickenPulsing(false), 800);
  }, 2000);
}
  function addWingoColor(c: 'red'|'green'|'purple') {
    setWingoPattern(prev => (prev.length < 6 ? [...prev, c] : prev));
  }
  function clearWingoPattern() { setWingoPattern([]); setWingoOutput(null); }
  function undoWingoPattern() { setWingoPattern(prev => prev.slice(0, -1)); }

  function weightedPick(redW: number, greenW: number, purpleW: number): 'red'|'green'|'purple' {
    const total = redW + greenW + purpleW;
    const r = Math.random() * total;
    if (r < redW) return 'red';
    if (r < redW + greenW) return 'green';
    return 'purple';
  }
  function analyzeWingoAndPredict() {
    // Base probabilities: Red 48%, Green 48%, Purple 4%
    let redW = 48, greenW = 48, purpleW = 4;
    const counts = { red: 0, green: 0, purple: 0 } as Record<'red'|'green'|'purple', number>;
    for (const c of wingoPattern) counts[c]++;
    // Light balancing: reduce weight of the more frequent between red/green
    if (counts.red > counts.green) redW -= 6; else if (counts.green > counts.red) greenW -= 6;
    // If last color repeats, nudge towards switching
    const last = wingoPattern[wingoPattern.length - 1];
    if (last === 'red') { redW -= 8; greenW += 8; }
    else if (last === 'green') { greenW -= 8; redW += 8; }
    redW = Math.max(10, redW); greenW = Math.max(10, greenW);
    purpleW = 4; // keep purple scarce

    // Start realistic 2s animation before showing result
    setWingoAnimating(true);
    setWingoOutput(null);
    setTimeout(() => {
      const predicted = weightedPick(redW, greenW, purpleW);
      setWingoOutput(predicted);
      setWingoPattern([]); // reset pattern for next round
      setTimeout(() => setWingoAnimating(false), 500);
    }, 2000);
  }

  async function handleVerify() {
    if (!paymentShot || !historyShot) return;
    try {
      const form = new FormData();
      form.append('payment', dataURLtoBlob(paymentShot), 'payment.png');
      form.append('history', dataURLtoBlob(historyShot), 'history.png');
      form.append('gameId', gameId);

      const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
      const host = window.location.hostname;
      const proto = (window.location.protocol === 'https:' ? 'https' : 'http');
      const bases = [
        envBase,
        'http://192.168.1.5:4000',
        'http://localhost:4000',
        `${proto}://${host}:4000`,
        'http://127.0.0.1:4000'
      ].filter(Boolean) as string[];

      let lastError = '';
      let okResp: Response | null = null;
      for(const base of bases){
        try {
          const resp = await fetch(`${base}/api/verify`, { method: 'POST', body: form });
          okResp = resp;
          break;
        } catch (e:any) {
          lastError = e?.message || 'Network error';
          continue;
        }
      }
      if(!okResp){
        setResultData({ ok: false, reason: 'Network error while verifying. Please try again.' });
        setResultOpen(true);
        return;
      }
      let json: any = null;
      try { json = await okResp.json(); } catch {}
      if (!okResp.ok) {
        setResultData({ ok: false, reason: json?.reason || `Server responded with ${okResp.status}` });
        setResultOpen(true);
        return;
      }
      if (json && typeof json.ok === 'boolean') {
        setResultData(json);
      } else {
        setResultData({ ok: false, reason: 'Unexpected server response.' });
      }
      setResultOpen(true);
    } catch (e) {
      setResultData({ ok: false, reason: 'Network error while verifying. Please try again.' });
      setResultOpen(true);
    }
  }

  function handleRetry() {
    // Close the result modal and clear previously uploaded screenshots
    setResultOpen(false);
    setPaymentShot(null);
    setHistoryShot(null);
    // Removed extracted/override states to simplify UI
    // Scroll back to the upload section for convenience
    const el = document.querySelector('.upload-grid');
    if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // New: Validate access key before entering Prediction Tool
  async function handleEnterTool(){
    try {
      setKeyError('');
      const key = enteredKey.trim();
      if(!key){
        setKeyError('Please enter an access key.');
        return;
      }
      const host = window.location.hostname;
      const proto = (window.location.protocol === 'https:' ? 'https' : 'http');
      const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
      const bases = [
        envBase,
        'http://192.168.1.5:4000',
        'http://localhost:4000',
        `${proto}://${host}:4000`,
        'http://127.0.0.1:4000'
      ].filter(Boolean) as string[];

      let lastError = '';
      for(const apiBase of bases){
        try {
          const resp = await fetch(`${apiBase}/api/validateKey?key=${encodeURIComponent(key)}`);
          let json: any = null;
          try {
            json = await resp.json();
          } catch {
            lastError = 'Unexpected server response.';
            continue;
          }
          if(!resp.ok){
            lastError = `Server responded with ${resp.status}`;
            continue;
          }
          if(json?.ok){
            setEnteredKey('');
            setToolAuthorized(true);
            return;
          } else {
            setKeyError(json?.reason || 'Invalid key.');
            return;
          }
        } catch (e:any) {
          lastError = e?.message || 'Network error';
          continue;
        }
      }
      setKeyError(lastError || 'Network error while validating.');
    } catch (e:any) {
      setKeyError('Network error while validating.');
    }
  }

  return (
    <div className="app-container">
      {(view === 'tool' && toolAuthorized && (selectedToolGame === 'aviator' || selectedToolGame === 'wingo')) ? (
        // Hide global background video for full-screen game views
        <></>
      ) : (
        <>
          <video
            className={`bg-video ${(view === 'tool' && toolAuthorized && (selectedToolGame === 'aviator' || selectedToolGame === 'wingo' || selectedToolGame === 'chicken')) ? 'hidden' : ''}`}
            src="/front-screen.mp4"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
          />
          {(view !== 'home' && !(view === 'tool' && toolAuthorized && (selectedToolGame === 'aviator' || selectedToolGame === 'wingo' || selectedToolGame === 'chicken')) ) ? <div className="dim-overlay" /> : null}
        </>
      )}
      <div className={`content ${view}`}>
        {view === 'landing' ? (
          <>
            <h1 className="heading">Welcome</h1>
            <div className="logos">
              <div
                className="logo-card tl"
                role="button"
                tabIndex={0}
                onClick={() => setView('home')}
                onKeyDown={(e) => { if (e.key === 'Enter') setView('home'); }}
              >
                <img src="/key-logo.jpg" alt="Key Access" />
                <div className="logo-title">Get Access Key</div>
              </div>
              <div
                className="logo-card tr"
                role="button"
                tabIndex={0}
                onClick={() => setView('tool')}
                onKeyDown={(e) => { if (e.key === 'Enter') setView('tool'); }}
              >
                <img src="/prediction-pro-logo.jpg" alt="Prediction Tool" />
                <div className="logo-title">Prediction Tool</div>
              </div>
            </div>
          </>
        ) : view === 'home' ? (
          <>
            <h1 className="heading">PREDICTION PRO</h1>

            <div className="logos">
              <div
                className="logo-card tl"
                role="button"
                tabIndex={0}
                onClick={() => openLink(LINKS.master)}
                onKeyDown={(e) => { if (e.key === 'Enter') openLink(LINKS.master); }}
              >
                <img src="/teenpattimaster.jpg" alt="TEEN PATTI MASTER" />
                <div className="logo-title">TEEN PATTI MASTER</div>
              </div>
              <div
                className="logo-card tr"
                role="button"
                tabIndex={0}
                onClick={() => openLink(LINKS.masterOld)}
                onKeyDown={(e) => { if (e.key === 'Enter') openLink(LINKS.masterOld); }}
              >
                <img src="/teenpattimaster-old.webp" alt="TEEN PATTI MASTER OLD" />
                <div className="logo-title">TEEN PATTI MASTER OLD</div>
              </div>
              <div
                className="logo-card bl"
                role="button"
                tabIndex={0}
                onClick={() => openLink(LINKS.gold)}
                onKeyDown={(e) => { if (e.key === 'Enter') openLink(LINKS.gold); }}
              >
                <img src="/teenpattigold.png" alt="TEEN PATTI GOLD" />
                <div className="logo-title">TEEN PATTI GOLD</div>
              </div>
              <div
                className="logo-card br"
                role="button"
                tabIndex={0}
                onClick={() => openLink(LINKS.goldOld)}
                onKeyDown={(e) => { if (e.key === 'Enter') openLink(LINKS.goldOld); }}
              >
                <img src="/teenpattigold-old.png" alt="TEEN PATTI GOLD OLD" />
                <div className="logo-title">TEEN PATTI GOLD OLD</div>
              </div>
            </div>

            <div className="actions">
              <button className="btn primary" onClick={() => setView('setup')}>Get Started</button>
              <button className="btn secondary" onClick={() => setIsNoticeOpen(true)}>Learn More</button>
            </div>

            {isNoticeOpen && (
              <div className="modal-backdrop" onClick={() => setIsNoticeOpen(false)}>
                <div
                  className="modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="notice-title"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 id="notice-title">Getting started with Prediction Pro</h2>
                  <p className="modal-intro">Follow these steps to set up the companion app and activate your access key:</p>
                  <ol className="modal-list">
                    <li>Download and install the relevant Teen Patti app from the links above.</li>
                    <li>Register your account and add your Game ID.</li>
                    <li>Complete the in-app onboarding and verification to receive your access key.</li>
                    <li>Open Prediction Pro, enter your access key, and begin using predictions.</li>
                  </ol>
                  <p className="modal-note">Need assistance? Open Settings in Prediction Pro to contact support.</p>
                  <div className="modal-actions">
                    <button className="btn secondary" onClick={() => setIsNoticeOpen(false)}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : view === 'setup' ? (
          <>
            <div className="setup-card">
              <h1 className="heading">Select App & Enter Game ID</h1>

              <div className="app-options" role="group" aria-label="Select app">
                 <button
                   className={`app-option ${selectedApp === 'master' ? 'selected' : ''}`}
                   onClick={() => setSelectedApp('master')}
                   aria-pressed={selectedApp === 'master'}
                 >
                   <img src="/teenpattimaster.jpg" alt="Teen Patti Master" />
                   <div className="app-name">Teen Patti Master</div>
                 </button>
                 <button
                   className={`app-option ${selectedApp === 'masterOld' ? 'selected' : ''}`}
                   onClick={() => setSelectedApp('masterOld')}
                   aria-pressed={selectedApp === 'masterOld'}
                 >
                   <img src="/teenpattimaster-old.webp" alt="Teen Patti Master Old" />
                   <div className="app-name">Teen Patti Master Old</div>
                 </button>
                 <button
                   className={`app-option ${selectedApp === 'gold' ? 'selected' : ''}`}
                   onClick={() => setSelectedApp('gold')}
                   aria-pressed={selectedApp === 'gold'}
                 >
                   <img src="/teenpattigold.png" alt="Teen Patti Gold" />
                   <div className="app-name">Teen Patti Gold</div>
                 </button>
                 <button
                   className={`app-option ${selectedApp === 'goldOld' ? 'selected' : ''}`}
                   onClick={() => setSelectedApp('goldOld')}
                   aria-pressed={selectedApp === 'goldOld'}
                 >
                   <img src="/teenpattigold-old.png" alt="Teen Patti Gold Old" />
                   <div className="app-name">Teen Patti Gold Old</div>
                 </button>
              </div>

              <div className="form-field">
                 <label htmlFor="gameId">Game ID</label>
                 <input
                   id="gameId"
                   type="tel"
                   inputMode="numeric"
                   pattern="[0-9]*"
                   placeholder="Enter your 6+ digit Game ID"
                   value={gameId}
                   onChange={(e) => setGameId(e.target.value.replace(/\D/g, ''))}
                 />
                 <div className="field-hint">Minimum 6 digits</div>
              </div>

              <div className="actions">
                 <button className="btn primary" disabled={!isValid} onClick={() => setView('plan')}>Next</button>
              </div>
            </div>
          </>
        ) : view === 'tool' ? (
          <>
            {!toolAuthorized ? (
              <div className="setup-card">
                <h1 className="heading">Prediction Tool Access</h1>
                <div className="form-field">
                  <label htmlFor="accessKey">Enter Access Key</label>
                  <input
                    id="accessKey"
                    type="text"
                    placeholder="Paste your access key"
                    value={enteredKey}
                    onChange={(e) => setEnteredKey(e.target.value)}
                  />
                </div>
                {keyError && (
                  <div className="validation-summary">{keyError}</div>
                )}
                <div className="actions">
                  <button className="btn primary" disabled={!enteredKey.trim()} onClick={handleEnterTool}>Enter Tool</button>
                  <button className="btn secondary" onClick={() => setView('home')}>Get a Key</button>
                </div>
              </div>
            ) : (
              selectedToolGame === null ? (
                <div className="tool-container">
                  <h1 className="heading">Prediction Tool</h1>
                  <div className="tool-grid" role="list" aria-label="Available games">
                    <div className="game-card" role="listitem" aria-label="Aviator" onClick={() => setSelectedToolGame('aviator')}>
                      <img className="game-logo" src="/aviatorlogo.jpg" alt="Aviator" />
                      <div className="game-name">Aviator</div>
                    </div>
                    <div className="game-card" role="listitem" aria-label="Chicken Road" onClick={() => setSelectedToolGame('chicken')}>
                      <img className="game-logo" src="/chickenroadlogo.jpg" alt="Chicken Road" />
                      <div className="game-name">Chicken Road</div>
                    </div>
                    <div className="game-card" role="listitem" aria-label="Wingo" onClick={() => setSelectedToolGame('wingo')}>
                      <img className="game-logo" src="/wingologo.jpg" alt="Wingo" />
                      <div className="game-name">Wingo</div>
                    </div>
                  </div>
                </div>
) : selectedToolGame === 'aviator' ? (
                <div className="aviator-screen" role="region" aria-label="Aviator Prediction">
                  <div className="aviator-topbar">
                    <div className="topbar-left">
                      <img src="/aviatorlogo.jpg" alt="Aviator" className="aviator-logo" />
                      <div className="aviator-title">Aviator Prediction</div>
                    </div>
                    <div className="topbar-actions">
                      <button
                        className="btn secondary"
                        onClick={() => {
                          setSelectedToolGame(null);
                          setAviatorAnimating(false);
                          aviatorVideoRef.current?.pause();
                        }}
                      >
                        Back to Games
                      </button>
                    </div>
                  </div>

                  <div className="aviator-full">
                    <div className="aviator-video-wrapper">
                      <video
                        ref={aviatorVideoRef}
                        className="aviator-video"
                        src="/aviator-animation.mp4"
                        preload="auto"
                        playsInline
                        muted
                        autoPlay
                        loop
                        disablePictureInPicture
                      />

                      <div className="aviator-overlay-left">
                        <div className={`overlay-multiplier ${aviatorAnimating ? 'running' : ''}`}>{aviatorMultiplier.toFixed(2)}x</div>
                      </div>
                    </div>
                  </div>

                  <div className="aviator-bottom-actions">
                    <button className="btn primary" onClick={startAviatorPredict}>Predict</button>
                  </div>
                </div>
              ) : selectedToolGame === 'chicken' ? (
                  <div className="chicken-screen" role="region" aria-label="Chicken Road Prediction">
                    <div className="chicken-topbar">
                      <div className="topbar-left">
                        <img src="/chickenroadlogo.jpg" alt="Chicken Road" className="chicken-logo" />
                        <div className="chicken-title">Chicken Road Prediction</div>
                      </div>
                      <div className="topbar-actions">
                        <button className="btn secondary" onClick={() => setSelectedToolGame(null)}>Back to Games</button>
                      </div>
                    </div>

                    <div className="chicken-body">
                      <div className="chicken-image">
                        {chickenAnimating ? (
                          <img src="/chickenroast.gif" alt="Chicken Running" />
                        ) : (
                          <img src="/chicken_road.png" alt="Chicken Road" />
                        )}
                        <div className="mode-indicator">Mode: {chickenMode.charAt(0).toUpperCase() + chickenMode.slice(1)}</div>
                      </div>

                      <div className="chicken-output">
                        <div className={`chicken-output-badge ${chickenPulsing ? 'pulse' : ''}`}>
                          {chickenAnimating && chickenOutput == null ? 'Predicting…' : (chickenOutput != null ? `${chickenOutput.toFixed(2)}x` : '—')}
                        </div>
                      </div>

                      <div className="chicken-actions">
                        <button className="btn primary" onClick={startChickenPredict}>Predict</button>
                      </div>

                      <div className="chicken-modes" role="group" aria-label="Difficulty mode">
                         {(['easy','medium','hard','hardcore'] as const).map((m) => (
                           <button
                             key={m}
                             className={`btn mode-btn ${chickenMode === m ? 'selected' : ''}`}
                             onClick={() => setChickenMode(m)}
                             aria-pressed={chickenMode === m}
                           >
                             {m.charAt(0).toUpperCase() + m.slice(1)}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
              ) : selectedToolGame === 'wingo' ? (
                  <div className="wingo-screen" role="region" aria-label="Wingo Prediction">
                    <div className="wingo-topbar">
                      <div className="topbar-left">
                        <img className="wingo-logo" src="/wingologo.jpg" alt="Wingo" />
                        <div className="wingo-title">Wingo Prediction</div>
                      </div>
                      <div className="topbar-actions">
                        <button className="btn secondary" onClick={() => setSelectedToolGame(null)}>Back to Games</button>
                      </div>
                    </div>

                    <div className="wingo-body">
                      <div className="wingo-output">
                        <div className={`wingo-output-badge ${wingoAnimating ? 'pulse' : ''} ${wingoOutput === 'red' ? 'red' : wingoOutput === 'green' ? 'green' : wingoOutput === 'purple' ? 'purple' : ''}`}>
                          {wingoAnimating && !wingoOutput ? 'Predicting…' : (wingoOutput ? wingoOutput.toUpperCase() : '—')}
                        </div>
                      </div>
    
                      <div className="wingo-pattern">
                        <h3 className="heading">Enter the pattern</h3>
                        <div className="wingo-slots">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`wingo-slot ${wingoPattern[i] || ''}`} />
                          ))}
                        </div>
                      </div>
    
                      <div className="wingo-controls">
                        <button className="btn red" onClick={() => addWingoColor('red')}>Red</button>
                        <button className="btn green" onClick={() => addWingoColor('green')}>Green</button>
                        <button className="btn purple" onClick={() => addWingoColor('purple')}>Purple</button>
                        <button className="btn secondary" onClick={undoWingoPattern}>Undo</button>
                      </div>
    
                      <div className="wingo-actions">
                        <button className="btn primary" onClick={analyzeWingoAndPredict}>Predict</button>
                      </div>
                    </div>
                  </div>
                  ) : (
                <div className="tool-container">
                  <h1 className="heading">Coming Soon</h1>
                  <p>Selected game will be available shortly.</p>
                  <div className="actions">
                    <button className="btn secondary" onClick={() => setSelectedToolGame(null)}>Back to Games</button>
                  </div>
                </div>
              )
            )}
          </>
        ) : (
          <>
            {view === 'plan' && (
              <div className="setup-card">
                {/* Banner at top */}
                <img src="/plan.jpg" alt="Plan Banner" className="plan-banner" />
            
                {/* How to proceed guide */}
                <div className="guide">
                  <h3 className="guide-title">How to Proceed</h3>
                  <ul className="guide-list">
                    <li>Recharge ₹500 in the game.</li>
                    <li>Upload a clear screenshot of your payment confirmation.</li>
                    <li>Upload a screenshot of your in‑game recharge history.</li>
                    <li>Click Submit.</li>
                  </ul>
                </div>
            
                {/* Upload zones */}
                <div className="upload-grid">
                  <div className="upload-zone">
                    <label className="upload-label">1) Payment confirmation (screenshot)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) readImage(file, (url) => setPaymentShot(url));
                      }}
                    />
                    {paymentShot ? (
                      <img className="image-preview" src={paymentShot} alt="Payment Screenshot Preview" />
                    ) : (
                      <div className="upload-hint">Attach a clear image of the payment confirmation</div>
                    )}
                  </div>
                  <div className="upload-zone">
                    <label className="upload-label">2) Recharge history (screenshot)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) readImage(file, (url) => setHistoryShot(url));
                      }}
                    />
                    {historyShot ? (
                      <img className="image-preview" src={historyShot} alt="Recharge History Screenshot Preview" />
                    ) : (
                      <div className="upload-hint">Attach a screenshot showing your in‑game recharge history</div>
                    )}
                  </div>
                </div>
            
                {/* Actions */}
                <div className="actions">
                  <button className="btn primary" disabled={!canComplete} onClick={handleVerify}>Submit</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {resultOpen && (
        <div className="modal-backdrop" onClick={() => setResultOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            {resultData?.ok ? (
              <>
                <h2>Access Key</h2>
                <p>Your verification was successful. Use the access key below:</p>
                <div className="form-field">
                  <input readOnly value={resultData.key || ''} />
                </div>
                <div className="modal-actions">
                  <button className="btn primary" onClick={() => navigator.clipboard.writeText(resultData?.key || '')}>Copy Key</button>
                  <button className="btn secondary" onClick={() => setResultOpen(false)}>Close</button>
                </div>
              </>
            ) : (
              <>
                <h2>Verification Failed</h2>
                <p>{resultData?.reason || 'Verification failed'}</p>
                <div className="modal-actions">
                  <button className="btn primary" onClick={handleRetry}>Re-upload Screenshots</button>
                  <button className="btn secondary" onClick={() => setResultOpen(false)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const rootEl = document.getElementById('app')!
createRoot(rootEl).render(<App />)
