import { useLang } from '@/contexts/LanguageContext';
import type { Lang } from '@/contexts/LanguageContext';

const l = (lang:Lang,es:string,it:string,en:string)=>lang==='it'?it:lang==='en'?en:es;

interface Props { isPremium:boolean; onActivate:()=>void; onNavigate:(p:string)=>void; }

const FREE_FEATURES: Record<Lang,string[]> = {
  es:['5 análisis por mes','Diagnóstico básico','Catálogo de equipos','Contacto Sa.To'],
  it:['5 analisi al mese','Diagnosi base','Catalogo apparecchiature','Contatto Sa.To'],
  en:['5 analyses per month','Basic diagnosis','Equipment catalog','Sa.To contact'],
};
const PRO_FEATURES: Record<Lang,string[]> = {
  es:['Análisis ilimitados','Diagnóstico profundo + urgencia','Reporte PDF descargable','Historial persistente','Dashboard con estadísticas','Acciones de mantenimiento detalladas','Soporte prioritario WhatsApp'],
  it:['Analisi illimitate','Diagnosi approfondita + urgenza','Report PDF scaricabile','Storico persistente','Dashboard con statistiche','Azioni di manutenzione dettagliate','Supporto prioritario WhatsApp'],
  en:['Unlimited analyses','Deep diagnosis + urgency','Downloadable PDF report','Persistent history','Statistics dashboard','Detailed maintenance actions','Priority WhatsApp support'],
};

export default function Premium({ isPremium, onActivate, onNavigate }: Props) {
  const { lang } = useLang();

  if (isPremium) return (
    <div className="px-4 py-5 space-y-5">
      <h1 className="text-xl font-black text-gray-900">⭐ Premium</h1>
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white text-center">
        <div className="text-5xl mb-3">🎉</div>
        <div className="font-black text-xl mb-1">{l(lang,'¡Eres Premium!','Sei Premium!','You are Premium!')}</div>
        <p className="text-amber-100 text-sm">{l(lang,'Tienes acceso a todas las funciones avanzadas de Sa.To DiagnosticAI.','Hai accesso a tutte le funzioni avanzate di Sa.To DiagnosticAI.','You have access to all advanced features of Sa.To DiagnosticAI.')}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="font-bold text-sm text-gray-800 mb-3">✅ {l(lang,'Funciones activas','Funzioni attive','Active features')}</div>
        {PRO_FEATURES[lang].map((f,i)=>(
          <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-emerald-500 font-bold text-sm">✓</span>
            <span className="text-gray-700 text-sm">{f}</span>
          </div>
        ))}
      </div>
      <button onClick={()=>onNavigate('scan')} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl active:scale-95 transition-transform">
        🔍 {l(lang,'Ir a escanear','Vai a scansionare','Go to scan')}
      </button>
    </div>
  );

  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{l(lang,'Planes','Piani','Plans')}</div>
        <h1 className="text-xl font-black text-gray-900">{l(lang,'Elige tu plan','Scegli il tuo piano','Choose your plan')}</h1>
      </div>

      {/* Free card */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="font-black text-gray-900 text-lg">Free</div>
          <div className="font-black text-gray-700 text-xl">$0<span className="text-sm text-gray-400 font-normal">/mes</span></div>
        </div>
        <p className="text-gray-500 text-xs mb-4">{l(lang,'Para explorar la app','Per esplorare l\'app','To explore the app')}</p>
        {FREE_FEATURES[lang].map((f,i)=>(
          <div key={i} className="flex items-center gap-2 py-1">
            <span className="text-gray-400 text-sm">○</span>
            <span className="text-gray-600 text-sm">{f}</span>
          </div>
        ))}
        <div className="mt-4 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl text-sm text-center">
          {l(lang,'Plan actual','Piano attuale','Current plan')}
        </div>
      </div>

      {/* Premium card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full">⭐ POPULAR</div>
        <div className="flex items-center justify-between mb-1">
          <div className="font-black text-gray-900 text-lg">Premium</div>
          <div>
            <div className="font-black text-amber-700 text-xl">$49<span className="text-sm text-gray-400 font-normal">/mes</span></div>
            <div className="text-gray-400 text-xs text-right">o $399/año</div>
          </div>
        </div>
        <p className="text-gray-600 text-xs mb-4">{l(lang,'Para operadores y plantas profesionales','Per operatori e impianti professionali','For operators and professional plants')}</p>
        {PRO_FEATURES[lang].map((f,i)=>(
          <div key={i} className="flex items-center gap-2 py-1">
            <span className="text-amber-500 font-black text-sm">✓</span>
            <span className="text-gray-700 text-sm font-medium">{f}</span>
          </div>
        ))}
        <button onClick={onActivate} className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-4 rounded-xl active:scale-95 transition-transform shadow-md text-sm">
          ⭐ {l(lang,'Activar Premium — $49/mes','Attiva Premium — $49/mese','Activate Premium — $49/mo')}
        </button>
        <p className="text-center text-gray-400 text-xs mt-2">{l(lang,'Cancela cuando quieras','Annulla quando vuoi','Cancel anytime')}</p>
      </div>

      {/* Enterprise */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="font-black text-gray-900 text-lg mb-1">Enterprise</div>
        <p className="text-gray-500 text-xs mb-3">{l(lang,'White-label con tu logo, acceso multi-usuario, API, soporte dedicado','White-label con il tuo logo, accesso multi-utente, API, supporto dedicato','White-label with your logo, multi-user access, API, dedicated support')}</p>
        <button onClick={()=>window.open('mailto:gerencia@satogreenenergy.com?subject=Enterprise Plan - DiagnosticAI')} className="w-full border-2 border-emerald-600 text-emerald-700 font-black py-3.5 rounded-xl active:scale-95 transition-transform text-sm">
          📩 {l(lang,'Contactar para cotización','Contattare per preventivo','Contact for quote')}
        </button>
      </div>
    </div>
  );
}
