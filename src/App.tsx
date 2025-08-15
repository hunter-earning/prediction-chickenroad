import React, { useEffect, useMemo, useState } from 'react';
import { BestAppsPage } from './BestAppsPage';

type Mode = 'easy' | 'medium' | 'hard' | 'hardcore';

type AppTarget = {
  id: string;
  name: string;
  logoText?: string;
  logo?: string; // path under public
  url?: string;  // optional promo/install link
  bonusLabel?: string;
};

type MultipliersByMode = Record<Mode, number[]>;

const DEFAULT_APPS: AppTarget[] = [
  { id: '9kboss', name: '9KBOSS', logo: '/images/app-logos/9kboss.png', url: 'https://cp1.my/BR5UAM/4ah3dof', bonusLabel: '₹30 Signup Bonus' },
  { id: 'machwin', name: 'MACHWIN', logo: '/images/app-logos/machwin.jpeg', url: 'https://cp1.my/BSHTD4/4ah3dof', bonusLabel: '₹30 Signup Bonus' },
];

const DEFAULT_MULTIPLIERS: MultipliersByMode = {
  // 70% chance (1.01x-1.56x) - 70 entries
  easy: [
    1.01, 1.01,  1.01, 1.01,
    1.03, 1.03, 1.03, 1.03, 1.03, 1.03,
    1.06, 1.06, 1.06,  1.06, 1.06, 1.06, 1.06, 1.06,
    1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10, 1.10,
    1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15,
    1.19, 1.19, 1.19, 1.19, 1.19, 1.19, 1.19, 1.19, 1.19, 1.19,
    1.24, 1.24, 1.24, 1.24, 1.24, 1.30, 1.30, 1.30, 1.30, 1.30,
    // 25% chance (1.56x-2.12x) - 25 entries
    1.35, 1.35, 1.35, 1.35, 1.35, 1.42, 1.42, 1.42, 1.42, 1.42,
    1.48, 1.48, 1.48, 1.48, 1.48, 1.56, 1.56, 1.56, 1.56, 1.56,
    1.65, 1.65, 1.75, 1.85, 1.98,
    // 4% chance (2.28x-3.28x) - 4 entries
    2.12, 2.28, 2.47, 2.70,
    // 1% chance (3.70x-5.39x) - 1 entry
    3.70
  ],
  // 65% chance (1.08x-2.05x) - 65 entries
  medium: [
     1.08, 1.08, 1.08, 1.08, 1.08,
    1.21, 1.21, 1.21, 1.21, 1.21, 1.21, 1.21, 1.21, 1.21,
    1.37, 1.37, 1.37, 1.37, 1.37, 1.37, 1.37, 1.37, 1.37, 1.37, 1.37, 1.37, 1.37,
    1.56, 1.56, 1.56, 1.56, 1.56, 1.56, 1.56, 1.56, 1.56, 1.56, 1.56, 1.56, 1.56,
    1.78, 1.78, 1.78, 1.78, 1.78, 1.78, 1.78, 1.78, 1.78, 2.05, 2.05, 2.05, 2.05, 2.05,
    // 30% chance (2.37x-5.61x) - 30 entries
    2.37, 2.37, 2.37, 2.37, 2.37, 2.37, 2.37, 2.37, 2.37, 2.37,
    2.77, 2.77, 2.77, 2.77, 2.77, 2.77, 2.77, 2.77, 2.77, 2.77,
    3.24, 3.24, 3.24, 3.24, 3.24, 3.85, 3.85, 4.62, 4.62, 5.61,
    // 5% chance (6.91x-14.29x) - 5 entries
    6.91, 6.91, 8.64, 10.99, 14.29
  ],
  // 60% chance (1.18x-1.83x) - 60 entries
  hard: [
    1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18,
    1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18,
    1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18,
    1.46, 1.46, 1.46, 1.46, 1.46, 1.46, 1.46, 1.46, 1.46, 1.46,
    1.46, 1.46, 1.46, 1.46, 1.46, 1.46, 1.46, 1.46, 1.46, 1.46,
    1.83, 1.83, 1.83, 1.83, 1.83, 1.83, 1.83, 1.83, 1.83, 1.83,
    // 35% chance (2.31x-5.02x) - 35 entries
    2.31, 2.31, 2.31, 2.31, 2.31, 2.31, 2.31, 2.31, 2.31, 2.31, 2.31, 2.31,
    2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95,
    3.82, 3.82, 3.82, 3.82, 3.82, 3.82, 5.02, 5.02, 5.02, 5.02, 5.02, 5.02,
    // 5% chance (6.66x-17.74x) - 5 entries
    6.66, 9.04, 12.52, 17.74, 17.74
  ],
  // 70% chance (1.44x-3.45x) - 70 entries
  hardcore: [
    // More variety in the 1.44-3.45 range (70 entries)
    1.44, 1.44, 1.44, 1.44, 1.44, 1.44, 1.44, 1.44, 1.44, 1.44,
    1.58, 1.58, 1.58, 1.58, 1.58, 1.58, 1.58, 1.58, 1.58, 1.58,
    1.72, 1.72, 1.72, 1.72, 1.72, 1.72, 1.72, 1.72, 1.72, 1.72,
    1.89, 1.89, 1.89, 1.89, 1.89, 1.89, 1.89, 1.89, 1.89, 1.89,
    2.21, 2.21, 2.21, 2.21, 2.21, 2.21, 2.21, 2.21, 2.21, 2.21,
    2.67, 2.67, 2.67, 2.67, 2.67, 2.67, 2.67, 2.67, 2.67, 2.67,
    3.05, 3.05, 3.05, 3.05, 3.05, 3.25, 3.25, 3.25, 3.45, 3.45,
    // 25% chance (5.53x-9.09x) - 25 entries
    5.53, 5.53, 5.53, 5.53, 5.53, 5.53, 5.53, 5.53, 5.53, 5.53,
    6.25, 6.25, 6.25, 6.25, 6.25, 7.15, 7.15, 7.15, 7.15, 7.15,
    8.12, 8.12, 8.12, 9.09, 9.09,
    // 5% chance (15.30x-48.70x) - 5 entries
    15.30, 19.45, 26.78, 35.60, 48.70
  ],
};

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

function parseMultipliers(text: string): number[] {
  return text
    .split(/[^0-9.]+/g)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => parseFloat(x))
    .filter((x) => Number.isFinite(x) && x > 0)
    .slice(0, 1000);
}

function formatMultipliers(values: number[]): string {
  return values.join(', ');
}

function seededRandom(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rankPredictions(values: number[], seed: string): { value: number; score: number }[] {
  const rand = seededRandom(seed);
  return values
    .map((v) => ({ value: v, score: Math.pow(rand(), 2) * (1 / Math.log2(v + 1.5)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

// Choose a single prediction strictly from the provided list.
// 95% chance pick from the safer lower 70% of the list; 5% from the rest.
type Segment = { min: number; max: number; weight: number };

function getModeSegments(mode: Mode): Segment[] {
  switch (mode) {
    case 'easy':
      return [
        { min: 1.01, max: 1.30, weight: 70 },  // 70% chance (1.01x-1.56x)
        { min: 1.35, max: 1.98, weight: 25 },  // 25% chance (1.56x-2.12x)
        { min: 2.12, max: 2.70, weight: 4 },   // 4% chance (2.28x-3.28x)
        { min: 3.70, max: 3.70, weight: 1 },   // 1% chance (3.70x-5.39x)
      ];
    case 'medium':
      return [
        { min: 1.08, max: 2.05, weight: 65 },  // 65% chance (1.08x-2.05x)
        { min: 2.37, max: 5.61, weight: 30 },  // 30% chance (2.37x-5.61x)
        { min: 6.91, max: 14.29, weight: 5 },  // 5% chance (6.91x-14.29x)
      ];
    case 'hard':
      return [
        { min: 1.18, max: 1.83, weight: 60 },  // 60% chance (1.18x-1.83x)
        { min: 2.31, max: 5.02, weight: 35 },  // 35% chance (2.31x-5.02x)
        { min: 6.66, max: 17.74, weight: 5 },  // 5% chance (6.66x-17.74x)
      ];
    case 'hardcore':
      return [
        { min: 1.44, max: 3.45, weight: 70 },  // 70% chance (1.44x-3.45x)
        { min: 5.53, max: 9.09, weight: 25 },  // 25% chance (5.53x-9.09x)
        { min: 15.30, max: 48.70, weight: 5 }, // 5% chance (15.30x-48.70x)
      ];
  }
}

function choosePredictionWithProbabilities(values: number[], mode: Mode, seed: string): number {
  const segments = getModeSegments(mode);
  const eps = 1e-9;
  const pools = segments.map((s) => values.filter((v) => v >= s.min - eps && v <= s.max + eps));
  
  // Debug log to check pool distribution
  console.log(`Mode: ${mode}, Pools:`, pools.map((p, i) => `Pool ${i}: ${p.length} values, weight: ${segments[i].weight}`));
  
  // Calculate total weight only from pools that have values
  const totalWeight = segments.reduce((sum, segment, i) => 
    sum + (pools[i].length > 0 ? segment.weight : 0), 0);
  
  // Create a new random generator with the seed
  const rng = seededRandom(seed);
  let chosenPool: number[] | null = null;

  if (totalWeight > 0) {
    // Get a random value between 0 and totalWeight
    const r = rng() * totalWeight;
    let accumulatedWeight = 0;
    
    // Select a pool based on weighted probability
    for (let i = 0; i < pools.length; i++) {
      if (pools[i].length === 0) continue; // Skip empty pools
      
      accumulatedWeight += segments[i].weight;
      if (r <= accumulatedWeight) {
        chosenPool = pools[i];
        console.log(`Selected pool ${i} with weight ${segments[i].weight}, r=${r}, accumulatedWeight=${accumulatedWeight}`);
        break;
      }
    }
  }
  
  // Fallback to all values if no pool was selected
  if (!chosenPool || chosenPool.length === 0) {
    console.log('No pool selected, using all values');
    chosenPool = [...values];
  }
  
  // Use a different seed for picking from the pool to avoid correlation
  const pickSeed = seed + ':pick:' + Date.now().toString(36);
  const pickRng = seededRandom(pickSeed);
  const index = Math.floor(pickRng() * chosenPool.length);
  
  console.log(`Selected value: ${chosenPool[index]} from pool of ${chosenPool.length} values`);
  return chosenPool[index];
}

function formatDisplayMultiplier(x: number): string {
  const s = x.toFixed(2);
  return s.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

export default function App(): JSX.Element {
  const [selectedApp, setSelectedApp] = useLocalStorage<AppTarget | null>('cr:selectedApp', null);
  const [gameId, setGameId] = useLocalStorage<string>('cr:gameId', '');
  const [showConnect, setShowConnect] = useState<boolean>(false);
  const [mode, setMode] = useLocalStorage<Mode>('cr:mode', 'easy');
  // Lock multipliers to the provided official lists to avoid any stale cached values
  const multipliers: MultipliersByMode = DEFAULT_MULTIPLIERS;
  const [predictState, setPredictState] = useState<'idle' | 'thinking' | 'boom' | 'done'>('idle');
  const [result, setResult] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [bestAppsOpen, setBestAppsOpen] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [hasPredicted, setHasPredicted] = useState<boolean>(false);
  const [showPredictionTool, setShowPredictionTool] = useState<boolean>(false);
  const [history, setHistory] = useLocalStorage<{ value: number; mode: Mode; at: number; appId: string; gameId: string }[]>(
    'cr:history',
    []
  );

  const isConnected = !!selectedApp && !!gameId.trim();

  useEffect(() => {
    if (selectedApp && gameId) {
      setShowConnect(false);
    }
  }, []);

  const modeTabs: { key: Mode; label: string }[] = [
    { key: 'easy', label: 'Easy' },
    { key: 'medium', label: 'Medium' },
    { key: 'hard', label: 'Hard' },
    { key: 'hardcore', label: 'Hardcore' },
  ];

  const handlePredict = () => {
    if (!isConnected) {
      setShowConnect(true);
      return;
    }
    setPredictState('thinking');
    setResult(null);

    window.setTimeout(() => {
      setPredictState('boom');
      // Generate a truly unique seed for each prediction to ensure variety
      const uniqueSeed = `${selectedApp?.id}:${gameId}:${Date.now()}:${Math.random().toString(36).substring(2)}:${history.length}`;
      const chosen = choosePredictionWithProbabilities(multipliers[mode], mode, uniqueSeed);
      window.setTimeout(() => {
        setResult(chosen);
        setPredictState('done');
        setHasPredicted(true);
        const next = [{ value: chosen, mode, at: Date.now(), appId: selectedApp!.id, gameId }, ...history].slice(0, 20);
        setHistory(next);
      }, 700);
    }, 1600);
  };

  const chickenLabel = useMemo(() => {
    if (predictState === 'thinking') return 'Thinking...';
    if (predictState === 'boom') return 'Boom!';
    if (predictState === 'done' && result != null) return 'Result ready';
    return 'Ready';
  }, [predictState, result]);

  return (
    <>
      {!showPredictionTool ? (
        <BestAppsPage 
          apps={DEFAULT_APPS} 
          onPredictionToolClick={() => {
            setShowConnect(true);
          }} 
        />
      ) : (
        <div className="container">
          <header className="header">
            <div className="nav" style={{ width: '100%' }}>
              <button className="hamburger" onClick={() => setDrawerOpen(true)} aria-label="Menu">☰</button>
              <div style={{ display: 'grid', placeItems: 'center' }}>
                <img className="banner-top" src="/images/app-logos/chickenroad-logo.png" alt="Chicken Road" onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.src = "data:image/svg+xml;utf8," + encodeURIComponent(BANNER_SVG);
                }} />
              </div>
              <button className="btn" onClick={() => setShowPredictionTool(false)}>Back</button>
            </div>
          </header>

          <section className="banner-section">
            {isConnected && (
              <div className="connection-strip">
                <img className="conn-logo" src={selectedApp?.logo ?? `/images/app-logos/${selectedApp?.id}.svg`} alt={selectedApp?.name ?? 'app'} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                <div style={{ fontWeight: 800 }}>{selectedApp?.name}</div>
                <div className="pill">ID: {gameId}</div>
                <div className="pill" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isConnecting && <span className="spinner" />} {isConnecting ? 'Connecting…' : 'Connected'}
                </div>
              </div>
            )}
            <div className="headline">Prediction Tool</div>
          </section>

          <main style={{ marginTop: 16 }}>
            <section className="panel" style={{ marginBottom: 16 }}>
              <div className="tabs" style={{ marginBottom: 12 }}>
                {modeTabs.map((t) => (
                  <button
                    key={t.key}
                    className={`tab ${mode === t.key ? 'active' : ''}`}
                    onClick={() => setMode(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="stage">
                <div className="glow" />
                {predictState === 'boom' && <div className="boom" />}
                {predictState === 'thinking' && (
                  <img
                    className="chicken-gif"
                    src="/images/app-logos/chickenroast.gif"
                    alt="Thinking..."
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                {predictState === 'idle' && (
                  <img
                    className="chicken-static"
                    src="/images/app-logos/chicken_road.png"
                    alt="Chicken"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/app-logos/chicken-road.jpg'; }}
                  />
                )}
                {(predictState === 'thinking' || predictState === 'idle') && (
                  <div className="thought">{chickenLabel}</div>
                )}
                {predictState === 'done' && result != null && (
                  <div style={{ position: 'absolute', inset: 16, display: 'grid', placeItems: 'center' }}>
                    <div className="result-card single">
                      <div className="result-rank">Prediction</div>
                      <div className="result-multiplier big">{formatDisplayMultiplier(result)}x</div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <button className="btn cta" onClick={handlePredict} disabled={!isConnected}>
                  {hasPredicted ? 'Re‑predict' : 'Predict'}
                </button>
              </div>
            </section>

            {history.length > 0 && (
              <section className="panel" style={{ marginBottom: 16 }}>
                <div className="title">Prediction history</div>
                <div className="history-list" style={{ marginTop: 10 }}>
                  {history.map((h, idx) => (
                    <div key={idx} className="history-item">
                      <div>
                        <span className="history-value">{h.value}x</span>
                        <span className="history-meta"> · {h.mode} · {new Date(h.at).toLocaleTimeString()}</span>
                      </div>
                      <div className="history-meta">{h.appId} · {h.gameId}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button className="btn" onClick={() => setHistory([])}>Clear history</button>
                </div>
              </section>
            )}

            {drawerOpen && (
              <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
                <aside className="drawer" onClick={(e) => e.stopPropagation()}>
                  <header>Menu</header>
                  <div className="menu-list">
                    <button className="menu-item" onClick={() => { setShowConnect(true); setDrawerOpen(false); }}>Change connection</button>
                    <button className="menu-item" onClick={() => { setBestAppsOpen(true); setDrawerOpen(false); }}>Best apps</button>
                    <button className="menu-item" onClick={() => { setAboutOpen(true); setDrawerOpen(false); }}>About</button>
                    <button className="menu-item" onClick={() => setDrawerOpen(false)}>Close</button>
                  </div>
                </aside>
              </div>
            )}

            {aboutOpen && (
              <div className="modal-backdrop" onClick={() => setAboutOpen(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <div className="title">About</div>
                  <div className="subtle" style={{ marginTop: 6 }}>
                    This tool provides a fun, animated prediction experience for Chicken Road across multiple modes. Add your own assets and tune multipliers.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button className="btn" onClick={() => setAboutOpen(false)}>Close</button>
                  </div>
                </div>
              </div>
            )}

            {bestAppsOpen && (
              <div className="modal-backdrop" onClick={() => setBestAppsOpen(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <div className="title">Best apps</div>
                  <div className="bestapps-list" style={{ marginTop: 8 }}>
                    {DEFAULT_APPS.map((a) => (
                      <div key={a.id} className="bestapp-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img src={a.logo ?? `/images/app-logos/${a.id}.svg`} alt={a.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10 }} />
                          <div className="bestapp-info">
                            <div style={{ fontWeight: 800 }}>{a.name}</div>
                            <div className="subtle" style={{ fontSize: 12 }}>ID: {a.id}</div>
                            {a.bonusLabel && <div className="pill" style={{ width: 'fit-content', marginTop: 6 }}>{a.bonusLabel}</div>}
                          </div>
                        </div>
                        {a.url && (
                          <a className="btn cta" href={a.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>Download</a>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button className="btn" onClick={() => setBestAppsOpen(false)}>Close</button>
                  </div>
                </div>
              </div>
            )}

            <footer className="footer">© {new Date().getFullYear()} Chicken Road Prediction Tool</footer>
          </main>

          {showConnect && (
            <ConnectModal
              apps={DEFAULT_APPS}
              selected={selectedApp}
              gameId={gameId}
              onClose={() => setShowConnect(false)}
              onSave={(app, id) => {
                setSelectedApp(app);
                setGameId(id);
                // Simulate connecting
                setTimeout(() => {
                  setShowConnect(false);
                  setShowPredictionTool(true);
                }, 900);
              }}
            />
          )}
        </div>
      )}
      {showConnect && (
        <ConnectModal
          apps={DEFAULT_APPS}
          selected={selectedApp}
          gameId={gameId}
          onClose={() => setShowConnect(false)}
          onSave={(app, id) => {
            setSelectedApp(app);
            setGameId(id);
            // Simulate connecting
            setTimeout(() => {
              setShowConnect(false);
              setShowPredictionTool(true);
            }, 900);
          }}
        />
      )}
    </>
  );
}

function ConnectModal(props: {
  apps: AppTarget[];
  selected: AppTarget | null;
  gameId: string;
  onSave: (app: AppTarget, gameId: string) => void;
  onClose: () => void;
}): JSX.Element {
  const { apps, selected, gameId, onSave, onClose } = props;
  const [selectedLocal, setSelectedLocal] = useState<AppTarget | null>(selected);
  const [gameIdLocal, setGameIdLocal] = useState<string>(gameId);
  const [connecting, setConnecting] = useState<boolean>(false);

  const canSave = !!selectedLocal && !!gameIdLocal.trim();

  const handleConnect = () => {
    if (!selectedLocal) return;
    setConnecting(true);
    setTimeout(() => {
      onSave(selectedLocal, gameIdLocal.trim());
      setConnecting(false);
    }, 900);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="title">Connect to application</div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="subtle" style={{ marginTop: 4, marginBottom: 12 }}>
          Choose an app, enter your Game ID, and connect.
        </div>

        <div className="apps">
          {apps.map((a) => (
            <button
              key={a.id}
              className={`app-card ${selectedLocal?.id === a.id ? 'selected' : ''}`}
              onClick={() => setSelectedLocal(a)}
            >
              <div className="app-logo" style={{ overflow: 'hidden' }}>
                <img src={a.logo ?? `/images/app-logos/${a.id}.svg`} alt={a.name}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 6 }} />
                {a.logoText && <span aria-hidden style={{ fontWeight: 800 }}>{a.logoText}</span>}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>{a.name}</div>
                {a.bonusLabel && <div className="subtle" style={{ fontSize: 12 }}>{a.bonusLabel}</div>}
              </div>
            </button>
          ))}
        </div>

        {selectedLocal?.url && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <a href={selectedLocal.url} target="_blank" rel="noreferrer" className="btn primary" style={{ textDecoration: 'none' }}>Open Link</a>
          </div>
        )}

        <div style={{ height: 12 }} />
        <div className="field">
          <label className="label">Game ID</label>
          <input
            className="input"
            placeholder="Enter your game ID"
            value={gameIdLocal}
            onChange={(e) => setGameIdLocal(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn brand" onClick={handleConnect} disabled={!canSave || connecting}>
            {connecting ? 'Connecting…' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}

const BANNER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="660" height="168" viewBox="0 0 660 168">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#ffd166"/>
      <stop offset="100%" stop-color="#ff9f1c"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="16" fill="#0c1427"/>
  <g filter="url(#shadow)">
    <text x="24" y="58" font-family="Verdana" font-size="42" font-weight="900" fill="url(#g)">Chicken Road</text>
    <text x="26" y="102" font-family="Verdana" font-size="28" font-weight="700" fill="#c7d2fe">Prediction Tool</text>
  </g>
  <text x="600" y="140" text-anchor="end" font-family="Verdana" font-size="64">🐔</text>
</svg>`;

