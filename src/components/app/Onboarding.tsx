import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import type { Lang } from '@/contexts/LanguageContext';

interface OnboardingProps { onComplete: () => void; }

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'es', flag: '🇦🇷', label: 'Español' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

type Slide = { icon: string; bg: string; title: Record<Lang,string>; desc: Record<Lang,string>; };

const slides: Slide[] = [
  {
    icon: '📸', bg: 'from-emerald-950 to-teal-800',
    title: { es:'Fotografía cualquier equipo', it:'Fotografa qualsiasi apparecchiatura', en:'Photograph any equipment' },
    desc:  { es:'Apunta la cámara a bombas, motores, reactores, paneles solares o cualquier parte de tu planta industrial.', it:'Punta la fotocamera su pompe, motori, reattori, pannelli solari o qualsiasi parte del tuo impianto industriale.', en:'Point your camera at pumps, motors, reactors, solar panels or any part of your industrial plant.' },
  },
  {
    icon: '🤖', bg: 'from-blue-950 to-indigo-800',
    title: { es:'IA diagnostica al instante', it:"L'IA diagnostica all'istante", en:'AI diagnoses instantly' },
    desc:  { es:'Nuestra IA identifica el componente, detecta fallas potenciales y te dice qué hacer — en segundos.', it:'La nostra IA identifica il componente, rileva guasti potenziali e ti dice cosa fare — in pochi secondi.', en:'Our AI identifies the component, detects potential failures and tells you what to do — in seconds.' },
  },
  {
    icon: '💰', bg: 'from-amber-900 to-orange-700',
    title: { es:'Precios Sa.To incluidos', it:'Prezzi Sa.To inclusi', en:'Sa.To pricing included' },
    desc:  { es:'Cada diagnóstico incluye soluciones y productos Sa.To Green Energy con precios reales y tiempos de entrega.', it:'Ogni diagnosi include soluzioni e prodotti Sa.To Green Energy con prezzi reali e tempi di consegna.', en:'Every diagnosis includes Sa.To Green Energy solutions and products with real prices and delivery times.' },
  },
  {
    icon: '🤝', bg: 'from-emerald-900 to-green-700',
    title: { es:'Asesoría técnica directa', it:'Consulenza tecnica diretta', en:'Direct technical support' },
    desc:  { es:'Con un toque conectas con nuestro equipo en Argentina, Italia y Europa para resolver tu problema de planta.', it:'Con un tocco ti connetti con il nostro team in Argentina, Italia ed Europa per risolvere il tuo problema.', en:'With one tap you connect with our team in Argentina, Italy and Europe to solve your plant problem.' },
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { lang, setLang } = useLang();
  const [slide, setSlide] = useState(0);
  const [langPicked, setLangPicked] = useState(false);
  const s = slides[slide];

  if (!langPicked) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-950 to-teal-900 text-white px-6 py-16">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-7xl mb-6">🌿</div>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Sa.To Green Energy</div>
        <h1 className="text-3xl font-black mb-2">DiagnosticAI</h1>
        <p className="text-emerald-300 text-sm mb-10">Smart diagnostics for industrial plants</p>
        <div className="w-full max-w-xs space-y-3">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setLangPicked(true); }}
              className="w-full flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl px-5 py-4 active:bg-white/20 transition-colors">
              <span className="text-3xl">{l.flag}</span>
              <span className="font-bold text-lg">{l.label}</span>
              <span className="ml-auto text-white/40">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br ${s.bg} text-white transition-all duration-500`}>
      <div className="flex justify-between items-center px-6 pt-12">
        <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{slide+1}/{slides.length}</div>
        <button onClick={onComplete} className="text-white/50 text-sm font-semibold">
          {lang==='it'?'Salta':lang==='en'?'Skip':'Saltar'} →
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-8xl mb-8 animate-bounce" style={{animationDuration:'2.5s'}}>{s.icon}</div>
        <h2 className="text-2xl font-black leading-tight mb-4">{s.title[lang]}</h2>
        <p className="text-white/75 text-sm leading-relaxed max-w-xs">{s.desc[lang]}</p>
      </div>
      <div className="px-8 pb-12 space-y-5">
        <div className="flex justify-center gap-2">
          {slides.map((_,i) => (
            <button key={i} onClick={()=>setSlide(i)}
              className={`rounded-full transition-all duration-300 ${i===slide?'w-8 h-2 bg-white':'w-2 h-2 bg-white/30'}`}/>
          ))}
        </div>
        {slide < slides.length-1
          ? <button onClick={()=>setSlide(s=>s+1)} className="w-full bg-white/20 border border-white/30 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform">
              {lang==='it'?'Continua →':lang==='en'?'Continue →':'Continuar →'}
            </button>
          : <button onClick={onComplete} className="w-full bg-white text-emerald-900 font-black py-4 rounded-2xl active:scale-95 transition-transform shadow-2xl">
              🚀 {lang==='it'?'Inizia ora':lang==='en'?'Get started':'Comenzar ahora'}
            </button>
        }
      </div>
    </div>
  );
}
