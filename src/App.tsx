import { useState, useEffect } from 'react';
import { LanguageProvider, useLang } from './contexts/LanguageContext';
import type { Lang } from './contexts/LanguageContext';
import Onboarding from './components/app/Onboarding';
import Dashboard from './components/app/Dashboard';
import Scan from './components/app/Scan';
import Catalog from './components/app/Catalog';
import Contact from './components/app/Contact';
import History from './components/app/History';
import Premium from './components/app/Premium';
import Settings from './components/app/Settings';
import type { Currency } from './components/app/Settings';

type Page = 'dashboard' | 'scan' | 'catalog' | 'history' | 'contact' | 'premium' | 'settings';

interface Entry {
  imageUrl: string;
  componentName: string;
  system: string;
  plantType: string;
  confidence: number;
  condition: string;
  date: string;
  issues: Array<{ title: string; severity: string }>;
  notes?: string;
}

const NAV: { page: Page; icon: string; labelKey: string }[] = [
  { page: 'dashboard', icon: '📊', labelKey: 'home' },
  { page: 'scan', icon: '🔍', labelKey: 'scan' },
  { page: 'catalog', icon: '📦', labelKey: 'catalog' },
  { page: 'history', icon: '🕒', labelKey: 'history' },
  { page: 'settings', icon: '⚙️', labelKey: 'settings' },
];

const HIST_KEY = 'sato_hist_v3';
const PREM_KEY = 'sato_premium';
const SCANS_KEY = 'sato_scans_used';
const ONBOARD_KEY = 'sato_onboarded_v3';
const CURRENCY_KEY = 'sato_currency';

const l = (lang: Lang, es: string, it: string, en: string) =>
  lang === 'it' ? it : lang === 'en' ? en : es;

function AppInner() {
  const { t, lang } = useLang();
  const [onboarded, setOnboarded] = useState(() => {
    try { return !!localStorage.getItem(ONBOARD_KEY); } catch { return false; }
  });
  const [page, setPage] = useState<Page>('dashboard');
  const [history, setHistory] = useState<Entry[]>(() => {
    try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch { return []; }
  });
  const [isPremium, setIsPremium] = useState(() => {
    try { return !!localStorage.getItem(PREM_KEY); } catch { return false; }
  });
  const [scansUsed, setScansUsed] = useState(() => {
    try { return parseInt(localStorage.getItem(SCANS_KEY) || '0'); } catch { return 0; }
  });
  const [currency, setCurrency] = useState<Currency>(() => {
    try { return (localStorage.getItem(CURRENCY_KEY) as Currency) || 'USD'; } catch { return 'USD'; }
  });

  useEffect(() => {
    try { localStorage.setItem(HIST_KEY, JSON.stringify(history)); } catch {}
  }, [history]);

  useEffect(() => {
    try { localStorage.setItem(CURRENCY_KEY, currency); } catch {}
  }, [currency]);

  const completeOnboarding = () => {
    try { localStorage.setItem(ONBOARD_KEY, '1'); } catch {}
    setOnboarded(true);
  };

  const activatePremium = () => {
    try { localStorage.setItem(PREM_KEY, '1'); } catch {}
    setIsPremium(true);
    setPage('dashboard');
    alert(l(lang,
      '✅ ¡Premium activado! Ahora tienes análisis ilimitados y todas las funciones avanzadas.',
      '✅ Premium attivato! Ora hai analisi illimitate e tutte le funzioni avanzate.',
      '✅ Premium activated! You now have unlimited analyses and all advanced features.'
    ));
  };

  const handleDiagnosis = (result: any) => {
    setHistory(prev => [...prev, {
      imageUrl: result.imageUrl,
      componentName: result.componentName,
      system: result.system,
      plantType: result.plantType || '',
      confidence: result.confidence,
      condition: result.condition || '',
      date: result.date,
      issues: result.issues || [],
      notes: '',
    }]);
  };

  const handleScanUsed = () => {
    const next = scansUsed + 1;
    setScansUsed(next);
    try { localStorage.setItem(SCANS_KEY, String(next)); } catch {}
  };

  const handleUpdateNote = (date: string, note: string) => {
    setHistory(prev => prev.map(e => e.date === date ? { ...e, notes: note } : e));
  };

  const clearHistory = () => {
    if (confirm(l(lang, '¿Borrar todo el historial?', 'Cancellare tutto lo storico?', 'Delete all history?'))) {
      setHistory([]);
      try { localStorage.removeItem(HIST_KEY); } catch {}
    }
  };

  if (!onboarded) return <Onboarding onComplete={completeOnboarding} />;

  const navBadge = (p: Page) => p === 'history' && history.length > 0 ? history.length : null;

  return (
    <div className="flex flex-col bg-gray-50" style={{ minHeight: '100dvh', maxWidth: 430, margin: '0 auto', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between flex-shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-base shadow-sm">🌿</div>
          <div>
            <div className="font-black text-gray-900 text-sm leading-none">Sa.To DiagnosticAI</div>
            <div className="text-gray-400 text-[10px] leading-none mt-0.5">
              {isPremium ? '⭐ Premium' : l(lang, 'Green Energy', 'Green Energy', 'Green Energy')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currency !== 'USD' && (
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {currency}
            </span>
          )}
          <button
            onClick={() => setPage('premium')}
            className={`text-xs font-black px-3 py-1.5 rounded-full transition-colors ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white active:opacity-80 shadow-sm'}`}
          >
            {isPremium ? '⭐ PRO' : l(lang, '⭐ Premium', '⭐ Premium', '⭐ Premium')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {page === 'dashboard' && <Dashboard entries={history} onNavigate={p => setPage(p as Page)} isPremium={isPremium} />}
        {page === 'scan' && (
          <Scan
            onDiagnosisComplete={handleDiagnosis}
            isPremium={isPremium}
            onNavigatePremium={() => setPage('premium')}
            scansUsed={scansUsed}
            onScanUsed={handleScanUsed}
            currency={currency}
          />
        )}
        {page === 'catalog' && <Catalog currency={currency} />}
        {page === 'history' && (
          <History
            entries={history}
            onClear={clearHistory}
            onUpdateNote={handleUpdateNote}
          />
        )}
        {page === 'contact' && <Contact />}
        {page === 'premium' && <Premium isPremium={isPremium} onActivate={activatePremium} onNavigate={p => setPage(p as Page)} />}
        {page === 'settings' && (
          <Settings
            currency={currency}
            onChangeCurrency={setCurrency}
          />
        )}
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-gray-100 flex-shrink-0 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
        <div className="flex">
          {NAV.map(item => {
            const badge = navBadge(item.page);
            return (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-all ${page === item.page ? 'text-emerald-600' : 'text-gray-400 active:text-gray-700'}`}
              >
                {page === item.page && <div className="absolute top-0 inset-x-3 h-0.5 bg-emerald-500 rounded-full" />}
                <span className="text-xl leading-none">{item.icon}</span>
                <span className={`text-[10px] font-bold leading-none ${page === item.page ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {t(item.labelKey)}
                </span>
                {badge && badge > 0 && (
                  <span className="absolute top-1 right-[calc(50%-14px)] bg-emerald-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-black">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <LanguageProvider><AppInner /></LanguageProvider>;
}
