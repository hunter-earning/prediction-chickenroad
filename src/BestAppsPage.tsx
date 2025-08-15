import React from 'react';

type AppTarget = {
  id: string;
  name: string;
  logoText?: string;
  logo?: string; // path under public
  url?: string;  // optional promo/install link
  bonusLabel?: string;
};

interface BestAppsPageProps {
  apps: AppTarget[];
  onPredictionToolClick: () => void;
}

export function BestAppsPage({ apps, onPredictionToolClick }: BestAppsPageProps): JSX.Element {
  return (
    <div className="container">
      <header className="header">
        <div className="nav" style={{ width: '100%' }}>
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <img className="banner-top" src="./images/app-logos/chickenroad-logo.png" alt="Chicken Road" />
          </div>
        </div>
      </header>

      <main>
        <section className="panel" style={{ marginBottom: 16 }}>
          <div className="title">Best Apps</div>
          <div className="subtle" style={{ marginTop: 6, marginBottom: 16 }}>
            <strong>Note:</strong> Prediction tool only works on the following platforms
          </div>
          
          <div className="bestapps-list">
            {apps.map((a) => (
              <div key={a.id} className="bestapp-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={a.logo ?? `./images/app-logos/${a.id}.svg`} alt={a.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10 }} />
                  <div className="bestapp-info">
                    <div style={{ fontWeight: 800 }}>{a.name}</div>
                    {a.bonusLabel && <div className="pill" style={{ width: 'fit-content', marginTop: 6 }}>{a.bonusLabel}</div>}
                  </div>
                </div>
                {a.url && (
                  <a className="btn cta" href={a.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>Download</a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="panel" style={{ marginBottom: 16 }}>
          <div className="title">Prediction Tool</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
            <img 
              className="chicken-static" 
              src="./images/app-logos/chickenroast.gif" 
              alt="Prediction Tool" 
              style={{ width: 120, height: 120, marginBottom: 16 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <button className="btn cta" onClick={onPredictionToolClick}>Open Prediction Tool</button>
          </div>
        </section>

        <footer className="footer">© {new Date().getFullYear()} Chicken Road Prediction Tool</footer>
      </main>
    </div>
  );
}