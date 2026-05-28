import { useLang } from '@/contexts/LanguageContext';
import type { Lang } from '@/contexts/LanguageContext';

export type Currency = 'USD' | 'EUR' | 'ARS';

const l = (lang: Lang, es: string, it: string, en: string) =>
  lang === 'it' ? it : lang === 'en' ? en : es;

interface Props {
  currency: Currency;
  onChangeCurrency: (c: Currency) => void;
}

const CURRENCIES: { code: Currency; label: string; symbol: string; flag: string; note: string }[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸', note: 'USD' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺', note: 'EUR' },
  { code: 'ARS', label: 'Peso Argentino', symbol: '$', flag: '🇦🇷', note: 'ARS' },
];

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

function requestNotificationPermission(lang: Lang) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  } else if (Notification.permission === 'granted') {
    alert(l(lang, '✅ Notificaciones ya activas', '✅ Notifiche già attive', '✅ Notifications already active'));
  } else {
    alert(l(lang, 'Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.', 'Le notifiche sono bloccate. Abilitale nelle impostazioni del browser.', 'Notifications are blocked. Enable them in your browser settings.'));
  }
}

export default function Settings({ currency, onChangeCurrency }: Props) {
  const { lang, setLang, t } = useLang();

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <h1 className="font-black text-gray-900 text-lg">⚙️ {t('settingsTitle')}</h1>
      </div>

      <div className="px-4 py-5 space-y-5">

        {/* Currency selector */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="font-bold text-gray-800 text-sm mb-3">
            💱 {t('currencyLabel')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map(cur => (
              <button
                key={cur.code}
                onClick={() => onChangeCurrency(cur.code)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all active:scale-95 ${
                  currency === cur.code
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-100 bg-gray-50 active:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{cur.flag}</span>
                <span className={`font-black text-xs ${currency === cur.code ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {cur.note}
                </span>
                <span className={`text-xs ${currency === cur.code ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {cur.symbol} {cur.label.split(' ')[0]}
                </span>
                {currency === cur.code && (
                  <span className="text-xs bg-emerald-500 text-white rounded-full px-2 py-0.5 font-black">✓</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-3">
            {l(lang,
              '* Los precios se convierten usando tasas aproximadas de referencia.',
              '* I prezzi vengono convertiti usando tassi di cambio approssimativi.',
              '* Prices are converted using approximate reference exchange rates.'
            )}
          </p>
        </div>

        {/* Language selector */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="font-bold text-gray-800 text-sm mb-3">
            🌐 {l(lang, 'Idioma de la app', 'Lingua dell\'app', 'App language')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map(lg => (
              <button
                key={lg.code}
                onClick={() => setLang(lg.code)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all active:scale-95 ${
                  lang === lg.code
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-100 bg-gray-50 active:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{lg.flag}</span>
                <span className={`font-bold text-xs ${lang === lg.code ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {lg.label}
                </span>
                {lang === lg.code && (
                  <span className="text-xs bg-emerald-500 text-white rounded-full px-2 py-0.5 font-black">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="font-bold text-gray-800 text-sm mb-1">
            🔔 {l(lang, 'Notificaciones push', 'Notifiche push', 'Push notifications')}
          </div>
          <p className="text-gray-500 text-xs mb-3">
            {t('notifPermission')}
          </p>
          <div className="flex items-center gap-3">
            <div className={`text-xs px-3 py-1 rounded-full font-bold ${
              typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
                ? 'bg-green-100 text-green-700'
                : typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {typeof window !== 'undefined' && 'Notification' in window
                ? Notification.permission === 'granted'
                  ? l(lang, '✅ Activas', '✅ Attive', '✅ Active')
                  : Notification.permission === 'denied'
                    ? l(lang, '🚫 Bloqueadas', '🚫 Bloccate', '🚫 Blocked')
                    : l(lang, '⏸ Sin configurar', '⏸ Non configurate', '⏸ Not configured')
                : l(lang, '❌ No disponible', '❌ Non disponibile', '❌ Not available')
              }
            </div>
            {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied' && (
              <button
                onClick={() => requestNotificationPermission(lang)}
                className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
              >
                {l(lang, 'Activar', 'Attiva', 'Enable')}
              </button>
            )}
          </div>
        </div>

        {/* App info */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
          <div className="font-bold text-gray-700 text-sm mb-2">🌿 Sa.To DiagnosticAI</div>
          <div className="space-y-1 text-xs text-gray-500">
            <div>v3.0 · Sa.To Green Energy S.A.</div>
            <div>gerencia@satogreenenergy.com</div>
            <div className="text-gray-400 text-xs mt-2">
              {l(lang,
                'Tasas de cambio aprox.: 1 USD = 0.92 EUR = 1.200 ARS',
                'Tassi di cambio aprox.: 1 USD = 0.92 EUR = 1.200 ARS',
                'Exchange rates approx.: 1 USD = 0.92 EUR = 1,200 ARS'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
