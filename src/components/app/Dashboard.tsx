import { useLang } from '@/contexts/LanguageContext';
import type { Lang } from '@/contexts/LanguageContext';

interface Entry { imageUrl:string; componentName:string; system:string; confidence:number; condition:string; date:string; issues:Array<{severity:string}>; }
interface Props { entries:Entry[]; onNavigate:(p:string)=>void; isPremium:boolean; }

const l = (lang:Lang, es:string, it:string, en:string) => lang==='it'?it:lang==='en'?en:es;

export default function Dashboard({ entries, onNavigate, isPremium }: Props) {
  const { lang } = useLang();
  const total = entries.length;
  const allIssues = entries.flatMap(e=>e.issues);
  const high = allIssues.filter(i=>i.severity==='high').length;
  const medium = allIssues.filter(i=>i.severity==='medium').length;
  const low = allIssues.filter(i=>i.severity==='low').length;
  const avgConf = total>0 ? Math.round(entries.reduce((s,e)=>s+(e.confidence||0),0)/total) : 0;

  const systems: Record<string,number> = {};
  entries.forEach(e=>{ systems[e.system]=(systems[e.system]||0)+1; });
  const topSys = Object.entries(systems).sort((a,b)=>b[1]-a[1]).slice(0,3);

  const recent = [...entries].reverse().slice(0,3);
  const fmtDate = (iso:string) => new Date(iso).toLocaleDateString(lang==='en'?'en-US':lang==='it'?'it-IT':'es-AR',{day:'2-digit',month:'short'});

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{l(lang,'Bienvenido','Benvenuto','Welcome')}</div>
          <h1 className="text-xl font-black text-gray-900">{l(lang,'Panel de Control','Pannello','Dashboard')}</h1>
        </div>
        {isPremium
          ? <span className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-black px-3 py-1.5 rounded-full">⭐ PREMIUM</span>
          : <button onClick={()=>onNavigate('premium')} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full active:scale-95 transition-transform shadow-sm">
              ⭐ {l(lang,'Premium','Premium','Premium')}
            </button>
        }
      </div>

      {/* CTA if empty */}
      {total===0 && (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-black text-lg mb-1">{l(lang,'¡Comienza tu primer análisis!','Inizia la tua prima analisi!','Start your first analysis!')}</div>
          <p className="text-emerald-100 text-xs mb-4">{l(lang,'Fotografía cualquier equipo y obtén un diagnóstico con IA en segundos','Fotografa qualsiasi apparecchiatura e ottieni una diagnosi IA in pochi secondi','Photograph any equipment and get an AI diagnosis in seconds')}</p>
          <button onClick={()=>onNavigate('scan')} className="bg-white text-emerald-700 font-black py-3 px-8 rounded-xl text-sm active:scale-95 transition-transform">
            📸 {l(lang,'Escanear ahora','Scansiona ora','Scan now')}
          </button>
        </div>
      )}

      {/* Stats */}
      {total>0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-4 text-white">
            <div className="text-4xl font-black">{total}</div>
            <div className="text-emerald-100 text-xs font-semibold mt-0.5">{l(lang,'Análisis totales','Analisi totali','Total analyses')}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="text-4xl font-black text-gray-900">{avgConf}<span className="text-xl text-gray-400">%</span></div>
            <div className="text-gray-500 text-xs font-semibold mt-0.5">{l(lang,'Precisión IA','Precisione IA','AI accuracy')}</div>
          </div>
        </div>
      )}

      {/* Issue bars */}
      {total>0 && (high+medium+low)>0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="font-bold text-gray-800 text-sm mb-3">⚠️ {l(lang,'Problemas detectados','Problemi rilevati','Issues found')}</div>
          {[
            {label:l(lang,'Alta','Alta','High'), val:high, color:'bg-red-500', track:'bg-red-100'},
            {label:l(lang,'Media','Media','Medium'), val:medium, color:'bg-amber-500', track:'bg-amber-100'},
            {label:l(lang,'Baja','Bassa','Low'), val:low, color:'bg-green-500', track:'bg-green-100'},
          ].map(item=>{
            const tot=high+medium+low||1;
            return (
              <div key={item.label} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-semibold">{item.label}</span>
                  <span className="font-black text-gray-800">{item.val}</span>
                </div>
                <div className={`h-2 rounded-full ${item.track}`}>
                  <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{width:`${Math.round(item.val/tot*100)}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top systems */}
      {topSys.length>0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="font-bold text-gray-800 text-sm mb-3">🏭 {l(lang,'Sistemas analizados','Sistemi analizzati','Systems analysed')}</div>
          <div className="space-y-2">
            {topSys.map(([sys,count])=>(
              <div key={sys} className="flex items-center justify-between">
                <span className="text-gray-700 text-sm truncate mr-2">{sys}</span>
                <span className="bg-emerald-100 text-emerald-700 font-black text-xs px-2.5 py-0.5 rounded-full flex-shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      {recent.length>0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-gray-800 text-sm">🕒 {l(lang,'Recientes','Recenti','Recent')}</div>
            <button onClick={()=>onNavigate('history')} className="text-emerald-600 text-xs font-bold">{l(lang,'Ver todos →','Tutti →','All →')}</button>
          </div>
          <div className="space-y-3">
            {recent.map((e,i)=>(
              <div key={i} className="flex items-center gap-3">
                <img src={e.imageUrl} alt="" className="w-11 h-11 rounded-xl object-cover border border-gray-100 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-xs truncate">{e.componentName}</div>
                  <div className="text-gray-400 text-xs">{e.system}</div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">{fmtDate(e.date)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <button onClick={()=>onNavigate('scan')} className="bg-emerald-600 text-white font-black py-4 rounded-2xl text-sm active:scale-95 transition-transform shadow-sm flex items-center justify-center gap-2">
          📸 {l(lang,'Nuevo análisis','Nuova analisi','New scan')}
        </button>
        <button onClick={()=>onNavigate('catalog')} className="bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
          📦 {l(lang,'Catálogo','Catalogo','Catalog')}
        </button>
      </div>
    </div>
  );
}
