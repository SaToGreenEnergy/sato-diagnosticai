import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import type { Lang } from '@/contexts/LanguageContext';
import { equipmentCatalog } from '@/data/catalog';
import type { Equipment, Category } from '@/data/catalog';
import type { Currency } from './Settings';
import { analytics } from '@/lib/analytics';

const FILTERS: { key: string; cat: Category | 'all' }[] = [
  { key: 'filterAll', cat: 'all' },
  { key: 'filterPumps', cat: 'pumps' },
  { key: 'filterWater', cat: 'water' },
  { key: 'filterBiogas', cat: 'biogas' },
  { key: 'filterEnergy', cat: 'energy' },
  { key: 'filterSolar', cat: 'solar' },
  { key: 'filterWind', cat: 'wind' },
  { key: 'filterEthanol', cat: 'ethanol' },
  { key: 'filterPyrolysis', cat: 'pyrolysis' },
  { key: 'filterCompostaje', cat: 'compostaje' },
];

// Approximate exchange rates (USD base)
const FX: Record<Currency, number> = { USD: 1, EUR: 0.92, ARS: 1200 };

function convertPrice(amount: number, from: string, to: Currency): number {
  const fromRate = FX[from as Currency] ?? 1;
  return Math.round((amount / fromRate) * FX[to]);
}

function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'ARS') return `ARS ${amount.toLocaleString('es-AR')}`;
  if (currency === 'EUR') return `€ ${amount.toLocaleString('de-DE')}`;
  return `USD ${amount.toLocaleString('en-US')}`;
}

const getEquipName = (eq: Equipment, lang: Lang) => {
  if (lang === 'it') return eq.nameIt;
  if (lang === 'en') return eq.nameEn;
  return eq.nameEs;
};
const getEquipDesc = (eq: Equipment, lang: Lang) => {
  if (lang === 'it') return eq.descIt;
  if (lang === 'en') return eq.descEn;
  return eq.descEs;
};
const getIssues = (eq: Equipment, lang: Lang) => {
  if (lang === 'it') return eq.commonIssues.it;
  if (lang === 'en') return eq.commonIssues.en;
  return eq.commonIssues.es;
};

interface Props {
  currency?: Currency;
}

export default function Catalog({ currency = 'USD' }: Props) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [search, setSearch] = useState('');

  const handleFilterChange = (cat: Category | 'all') => {
    setFilter(cat);
    analytics.catalogViewed(cat);
  };

  const filtered = equipmentCatalog.filter(eq => {
    const matchCat = filter === 'all' || eq.category === filter;
    const name = getEquipName(eq, lang).toLowerCase();
    const desc = getEquipDesc(eq, lang).toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleEquipmentOpen = (eq: Equipment) => {
    setSelected(eq);
    analytics.equipmentOpened(eq.id, getEquipName(eq, lang));
  };

  const openEmail = (eq: Equipment) => {
    const subject = encodeURIComponent(t('subjectEmail'));
    const body = encodeURIComponent(`${t('msgBody')}\n\nEquipo de interés: ${getEquipName(eq, lang)}`);
    window.open(`mailto:gerencia@satogreenenergy.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-gray-900 text-base">📦 {t('catalogTitle')}</h1>
          {currency !== 'USD' && (
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{currency}</span>
          )}
        </div>
        <input
          type="search"
          placeholder={lang === 'es' ? 'Buscar equipo...' : lang === 'it' ? 'Cerca apparecchiatura...' : 'Search equipment...'}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-emerald-400 bg-gray-50"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === f.cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {t(f.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3 flex-1">
        {filtered.map(eq => {
          const pMin = convertPrice(eq.priceMin, eq.currency, currency);
          const pMax = convertPrice(eq.priceMax, eq.currency, currency);
          return (
            <button
              key={eq.id}
              onClick={() => handleEquipmentOpen(eq)}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-left active:scale-95 transition-transform hover:border-emerald-200"
            >
              <div className="text-3xl mb-2">{eq.icon}</div>
              <div className="font-bold text-gray-900 text-sm leading-tight mb-1">{getEquipName(eq, lang)}</div>
              <div className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-3">{getEquipDesc(eq, lang)}</div>
              {eq.contactForQuote ? (
                <div className="font-bold text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 mt-1 inline-block">
                  📞 {t('contactForQuote')}
                </div>
              ) : (
                <>
                  <div className="font-black text-emerald-700 text-sm">
                    {formatPrice(pMin, currency)} – {formatPrice(pMax, currency).replace(/^[A-Z€$]+\s?/, '')}
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">{eq.leadTimeDays} {t('days')}</div>
                </>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
            {lang === 'es' ? 'Sin resultados' : lang === 'it' ? 'Nessun risultato' : 'No results'}
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div className="font-bold text-gray-900 text-base">{t('equipDetail')}</div>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl leading-none">✕</button>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{selected.icon}</div>
                <div>
                  <div className="font-extrabold text-gray-900 text-lg leading-tight">{getEquipName(selected, lang)}</div>
                  <div className="text-gray-500 text-xs mt-1">{t('system')}: {selected.category.toUpperCase()}</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{getEquipDesc(selected, lang)}</p>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{t('estPrice')}</div>
                  {selected.contactForQuote ? (
                    <div className="font-bold text-emerald-700 text-sm">📞 {t('contactForQuote')}</div>
                  ) : (
                    <div className="font-black text-emerald-700 text-base">
                      {formatPrice(convertPrice(selected.priceMin, selected.currency, currency), currency)} –{' '}
                      {formatPrice(convertPrice(selected.priceMax, selected.currency, currency), currency).replace(/^[A-Z€$]+\s?/, '')}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{t('leadTime')}</div>
                  <div className="font-bold text-gray-800">{selected.leadTimeDays} {t('days')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{t('availability')}</div>
                  <div className="text-green-600 font-semibold text-sm">✅ {t('available')}</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-gray-800 text-sm mb-3">⚠️ {t('possibleProblems')}</div>
                <div className="space-y-2">
                  {getIssues(selected, lang).map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span className="text-gray-700 text-xs">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pb-2">
                <button
                  onClick={() => { openEmail(selected); analytics.contactClicked('catalog', getEquipName(selected, lang)); }}
                  className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  ✉️ {t('requestQuote')}
                </button>
                <button
                  onClick={() => window.open('https://wa.me/5493516973809')}
                  className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  💬 WhatsApp Sa.To
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
