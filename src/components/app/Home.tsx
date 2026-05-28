import { useLang } from '@/contexts/LanguageContext';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { t } = useLang();

  const features = [
    { key: 'f1', desc: 'f1d', icon: '🤖' },
    { key: 'f2', desc: 'f2d', icon: '🏭' },
    { key: 'f3', desc: 'f3d', icon: '💰' },
    { key: 'f4', desc: 'f4d', icon: '📞' },
  ];

  const steps = [
    { n: '01', key: 'step1', desc: 'step1d', icon: '📷' },
    { n: '02', key: 'step2', desc: 'step2d', icon: '🤖' },
    { n: '03', key: 'step3', desc: 'step3d', icon: '📋' },
    { n: '04', key: 'step4', desc: 'step4d', icon: '🤝' },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 text-white px-5 pt-8 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🌿</div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Sa.To Green Energy</div>
            <div className="font-bold text-lg leading-tight">{t('appName')}</div>
          </div>
        </div>
        <h1 className="text-2xl font-extrabold leading-tight mb-3">{t('heroTitle')}</h1>
        <p className="text-emerald-200 text-sm leading-relaxed mb-7">{t('heroSub')}</p>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('scan')}
            className="flex-1 bg-white text-emerald-900 font-bold py-3 px-4 rounded-xl text-sm shadow-lg active:scale-95 transition-transform"
          >
            🔍 {t('startScan')}
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="flex-1 border border-white/40 text-white font-semibold py-3 px-4 rounded-xl text-sm active:scale-95 transition-transform"
          >
            📦 {t('viewCatalog')}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="px-5 py-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">{t('features')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f) => (
            <div key={f.key} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-bold text-gray-900 text-sm leading-tight mb-1">{t(f.key)}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{t(f.desc)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 pb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">{t('howItWorks')}</h2>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex-shrink-0 w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-xs">
                {s.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{s.icon} {t(s.key)}</div>
                <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{t(s.desc)}</div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mx-5 mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
        <div className="font-bold text-base mb-1">¿Necesitas asesoría?</div>
        <div className="text-emerald-100 text-xs mb-4">Nuestro equipo técnico está disponible para visitas en campo en Argentina, Italia y Europa.</div>
        <button
          onClick={() => onNavigate('contact')}
          className="bg-white text-emerald-700 font-bold py-2.5 px-5 rounded-xl text-sm w-full active:scale-95 transition-transform"
        >
          📞 {t('requestAssistance')}
        </button>
      </div>
    </div>
  );
}
