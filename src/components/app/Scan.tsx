import { useState, useRef, useCallback } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import type { Lang } from '@/contexts/LanguageContext';
import type { Currency } from './Settings';

const l = (lang: Lang, es: string, it: string, en: string) =>
  lang === 'it' ? it : lang === 'en' ? en : es;

interface Issue {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  urgency?: string;
}
interface SatoProduct {
  name: string;
  description: string;
  priceMin: number;
  priceMax: number;
  currency: string;
  leadTimeDays: number;
  serviceType?: string;
}
interface DiagnosisResult {
  componentName: string;
  system: string;
  plantType: string;
  confidence: number;
  condition: string;
  operationalStatus: string;
  estimatedDowntime?: string;
  priorityLevel?: string;
  issues: Issue[];
  maintenanceActions: string[];
  satoProducts: SatoProduct[];
}

interface Props {
  onDiagnosisComplete: (r: DiagnosisResult & { imageUrl: string; date: string }) => void;
  isPremium: boolean;
  onNavigatePremium: () => void;
  scansUsed: number;
  onScanUsed: () => void;
  currency: Currency;
}

const FREE_LIMIT = 10;
const SEV_COLOR: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

// Approximate exchange rates (USD base)
const FX: Record<Currency, number> = { USD: 1, EUR: 0.92, ARS: 1200 };

function convertPrice(amount: number, from: string, to: Currency): number {
  const fromRate = FX[from as Currency] ?? 1;
  return Math.round((amount / fromRate) * FX[to]);
}

function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'ARS') return `ARS ${(amount).toLocaleString('es-AR')}`;
  if (currency === 'EUR') return `€ ${amount.toLocaleString('de-DE')}`;
  return `USD ${amount.toLocaleString('en-US')}`;
}

function fireCriticalNotification(result: DiagnosisResult, lang: Lang) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const highIssue = result.issues.find(i => i.severity === 'high');
  if (!highIssue) return;
  const title = l(lang, '⚠️ Problema Crítico Detectado', '⚠️ Problema Critico Rilevato', '⚠️ Critical Issue Detected');
  const body = `${result.componentName}: ${highIssue.title}`;
  try {
    new Notification(title, { body, icon: '/favicon.ico' });
  } catch {}
}

function buildPrompt(lang: Lang): string {
  return `You are an expert industrial diagnostician and senior engineer at Sa.To Green Energy S.A. with 20+ years of field experience. Your role is to perform precise, technically rigorous diagnostics of industrial equipment.

SYSTEMS YOU COVER:
- WWTP/Wastewater: DAF flotators, MBBR reactors, decanter centrifuges, submersible pumps, sludge treatment
- Anaerobic Digestion & Biogas: CSTR digesters, agitators (ERAS-309©), biogas purification, H2S removal
- CHP Cogeneration: gas engines (FAW, Jenbacher), heat exchangers, electrical generators, turbochargers
- Solar PV: monocrystalline panels, string/central inverters, string boxes, DC wiring, mounting structures
- Wind Energy: turbines, gearboxes, generators, pitch systems, towers, blades
- Bioethanol: fermentation tanks, distillation columns, CIP systems, heat exchangers
- Pyrolysis & Thermal: reactors, feeding systems, syngas lines, char handling, GreenDRY BioDryer©
- Composting: windrow turners, forced aeration systems, biofilters, odor control

DIAGNOSTIC PROTOCOL:
1. Identify the exact component and its industrial context with technical precision
2. Assess all visible deterioration: corrosion grade (1-5), wear pattern, fouling type, structural integrity, fluid/gas leaks
3. Perform root cause analysis for each observed anomaly — identify the failure mechanism (fatigue, corrosion, fouling, overload, misalignment, contamination)
4. Evaluate operational risk: safety hazard, production impact, environmental risk
5. Prioritize issues by urgency and business impact
6. Recommend specific Sa.To products and services that directly address each problem

CONFIDENCE SCORING:
- 90-100%: Component clearly visible, multiple identifying features, deterioration clearly quantifiable
- 70-89%: Component recognizable, minor ambiguity in specific sub-components
- 50-69%: General identification possible, unclear details — note what additional information is needed
- <50%: Use condition "Unknown", explain what is not visible

SEVERITY CLASSIFICATION:
- HIGH: Immediate failure risk, safety hazard, production loss >30%, or structural damage
- MEDIUM: Performance degraded >15%, risk of failure within 30 days, requires intervention this week
- LOW: Minor efficiency loss <15%, preventive action within 90 days

${lang === 'es' ? 'Respond entirely in SPANISH.' : lang === 'it' ? 'Respond entirely in ITALIAN.' : 'Respond entirely in ENGLISH.'}

Respond ONLY with valid JSON (no markdown, no text outside JSON):
{
  "componentName": "exact technical component name and model if visible",
  "system": "primary industrial system",
  "plantType": "specific plant type (e.g. Slaughterhouse WWTP, Agricultural Biogas Plant, Rooftop Solar PV)",
  "confidence": 85,
  "condition": "Good|Fair|Deteriorated|Critical|Unknown",
  "operationalStatus": "Operational|Needs maintenance|Out of service|Critical risk",
  "estimatedDowntime": "0-4h|4-24h|1-7 days|+7 days",
  "priorityLevel": "Immediate|Urgent|Planned|Preventive",
  "issues": [
    {
      "title": "concise issue name (max 8 words)",
      "description": "technical root cause analysis: what is observed, why it is happening, what will happen if not addressed, and what parameters are likely affected",
      "severity": "high|medium|low",
      "recommendation": "step-by-step corrective action with specific technical details (tools, parameters, procedures)",
      "urgency": "Act immediately|Within 24h|This week|Next maintenance window"
    }
  ],
  "maintenanceActions": ["action 1 — with specific technical detail", "action 2", "action 3"],
  "satoProducts": [
    {
      "name": "Sa.To product or service name",
      "description": "how this product/service directly resolves the identified issue(s)",
      "priceMin": 1500,
      "priceMax": 8000,
      "currency": "USD",
      "leadTimeDays": 45,
      "serviceType": "Supply|Installation|Service|Consulting|Maintenance|Inspection|Training"
    }
  ]
}

Generate 3-6 issues sorted by severity (HIGH first). Include 2-4 Sa.To products/services. Be technically specific — no generic responses.`;
}

export default function Scan({
  onDiagnosisComplete,
  isPremium,
  onNavigatePremium,
  scansUsed,
  onScanUsed,
  currency,
}: Props) {
  const { lang } = useLang();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'confirm' | 'result'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const remaining = FREE_LIMIT - scansUsed;
  const canScan = isPremium || remaining > 0;

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setImageUrl(url);
      setImageB64(url.split(',')[1]);
      setResult(null);
      setError(null);
      setStep('confirm');
    };
    reader.readAsDataURL(file);
  }, []);

  const analyze = async () => {
    if (!imageB64 || !canScan) return;
    setAnalyzing(true);
    setError(null);
    onScanUsed();
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageB64 } },
              { type: 'text', text: buildPrompt(lang) },
            ],
          }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || '';
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON');
      const parsed: DiagnosisResult = JSON.parse(match[0]);
      setResult(parsed);
      setStep('result');
      onDiagnosisComplete({ ...parsed, imageUrl: imageUrl!, date: new Date().toISOString() });

      // Fire push notification if critical issues found
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') fireCriticalNotification(parsed, lang);
        });
      } else {
        fireCriticalNotification(parsed, lang);
      }
    } catch {
      setError(l(lang, 'Error al analizar. Verifica tu conexión e intenta de nuevo.', 'Errore analisi. Verifica la connessione e riprova.', 'Analysis error. Check your connection and try again.'));
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImageUrl(null);
    setImageB64(null);
    setResult(null);
    setError(null);
    setStep('upload');
  };

  const openEmail = (prod?: string) => {
    const sub = encodeURIComponent(l(lang, 'Asesoría Técnica - DiagnosticAI', 'Consulenza Tecnica - DiagnosticAI', 'Technical Support - DiagnosticAI'));
    const info = result
      ? `\n\n${l(lang, 'Diagnóstico', 'Diagnosi', 'Diagnosis')}: ${result.componentName} (${result.system})\n${l(lang, 'Estado', 'Stato', 'Condition')}: ${result.condition}\n${l(lang, 'Prioridad', 'Priorità', 'Priority')}: ${result.priorityLevel || '-'}`
      : '';
    const body = encodeURIComponent(
      `${l(lang, 'Estimado equipo Sa.To', 'Gentile team Sa.To', 'Dear Sa.To team')},\n\n${l(lang, 'Necesito asesoría técnica para el siguiente equipo/problema', 'Ho bisogno di consulenza tecnica per la seguente apparecchiatura/problema', 'I need technical support for the following equipment/problem')}:\n\n[${l(lang, 'DESCRIBIR EQUIPO', 'DESCRIVERE APPARECCHIATURA', 'DESCRIBE EQUIPMENT')}]${info}${prod ? `\n\n${l(lang, 'Producto de interés', 'Prodotto di interesse', 'Product of interest')}: ${prod}` : ''}\n\n${l(lang, 'Gracias', 'Grazie', 'Thank you')}.`
    );
    window.open(`mailto:gerencia@satogreenenergy.com?subject=${sub}&body=${body}`);
  };

  const downloadReport = () => {
    if (!result) return;
    const date = new Date().toLocaleDateString();
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sa.To DiagnosticAI — Report</title>
<style>body{font-family:Arial,sans-serif;max-width:820px;margin:0 auto;padding:40px;color:#111}
.hdr{background:linear-gradient(135deg,#064e3b,#0d9488);color:#fff;padding:28px 32px;border-radius:14px;margin-bottom:28px}
.hdr h1{margin:0;font-size:22px;font-weight:900}.hdr p{margin:6px 0 0;opacity:.75;font-size:13px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
.stat{background:#f0fdf4;border:1px solid #a7f3d0;border-radius:10px;padding:16px;text-align:center}
.stat-n{font-size:28px;font-weight:900;color:#059669}.stat-l{font-size:11px;color:#6b7280;margin-top:3px}
.sec{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:16px 0}
.sec h3{margin:0 0 14px;color:#065f46;font-size:15px;font-weight:700}
.issue{border-left:4px solid #d1d5db;padding:12px 16px;margin:10px 0;background:#fff;border-radius:0 8px 8px 0}
.issue.high{border-color:#ef4444}.issue.medium{border-color:#f59e0b}.issue.low{border-color:#10b981}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;margin:2px}
.bh{background:#fee2e2;color:#991b1b}.bm{background:#fef3c7;color:#92400e}.bl{background:#d1fae5;color:#065f46}
.prod{background:#fff;border:1px solid #d1fae5;border-radius:8px;padding:14px;margin:8px 0}
.price{color:#059669;font-weight:900;font-size:16px}
table{width:100%;border-collapse:collapse;font-size:13px}
td,th{padding:8px 12px;text-align:left;border-bottom:1px solid #e5e7eb}th{background:#f3f4f6;font-weight:700}
footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:11px}
</style></head><body>
<div class="hdr"><h1>🌿 Sa.To DiagnosticAI — ${l(lang, 'Informe de Diagnóstico', 'Rapporto Diagnostico', 'Diagnostic Report')}</h1>
<p>Sa.To Green Energy S.A. | gerencia@satogreenenergy.com | ${date}</p></div>
<div class="grid2">
<div class="stat"><div class="stat-n">${result.confidence}%</div><div class="stat-l">IA Confidence</div></div>
<div class="stat"><div class="stat-n">${result.issues.length}</div><div class="stat-l">${l(lang, 'Problemas', 'Problemi', 'Issues')}</div></div>
</div>
<div class="sec"><h3>📋 ${l(lang, 'Componente Analizado', 'Componente Analizzato', 'Analysed Component')}</h3>
<table><tr><th>${l(lang, 'Componente', 'Componente', 'Component')}</th><td><b>${result.componentName}</b></td></tr>
<tr><th>${l(lang, 'Sistema', 'Sistema', 'System')}</th><td>${result.system}</td></tr>
<tr><th>${l(lang, 'Tipo de Planta', 'Tipo Impianto', 'Plant Type')}</th><td>${result.plantType || '-'}</td></tr>
<tr><th>${l(lang, 'Estado', 'Condizione', 'Condition')}</th><td><b>${result.condition}</b></td></tr>
<tr><th>${l(lang, 'Estado Operativo', 'Stato Operativo', 'Operational Status')}</th><td>${result.operationalStatus}</td></tr>
<tr><th>${l(lang, 'Parada Estimada', 'Fermo Stimato', 'Est. Downtime')}</th><td>${result.estimatedDowntime || '-'}</td></tr>
<tr><th>${l(lang, 'Prioridad', 'Priorità', 'Priority')}</th><td><b>${result.priorityLevel || '-'}</b></td></tr>
</table></div>
<div class="sec"><h3>⚠️ ${l(lang, 'Problemas Detectados', 'Problemi Rilevati', 'Detected Issues')}</h3>
${result.issues.map(i => `<div class="issue ${i.severity}"><b>${i.title}</b> <span class="badge b${i.severity[0]}">${i.severity.toUpperCase()}</span>${i.urgency ? ` <span class="badge" style="background:#e0f2fe;color:#0c4a6e">${i.urgency}</span>` : ''}
<p style="margin:8px 0 5px;color:#4b5563;font-size:13px">${i.description}</p>
<p style="margin:0;color:#059669;font-size:13px">💡 <em>${i.recommendation}</em></p></div>`).join('')}
</div>
${result.maintenanceActions?.length ? `<div class="sec"><h3>🔧 ${l(lang, 'Acciones de Mantenimiento', 'Azioni di Manutenzione', 'Maintenance Actions')}</h3>
<ul style="margin:0;padding-left:20px">${result.maintenanceActions.map((a, i) => `<li style="margin:6px 0;font-size:13px"><b>${i + 1}.</b> ${a}</li>`).join('')}</ul></div>` : ''}
<div class="sec" style="border-color:#a7f3d0;background:#f0fdf4"><h3>🌿 ${l(lang, 'Soluciones Sa.To Green Energy', 'Soluzioni Sa.To Green Energy', 'Sa.To Green Energy Solutions')}</h3>
${result.satoProducts.map(p => `<div class="prod"><b>${p.name}</b>${p.serviceType ? ` <span class="badge" style="background:#dbeafe;color:#1e40af">${p.serviceType}</span>` : ''}
<p style="margin:6px 0;color:#4b5563;font-size:13px">${p.description}</p>
<div class="price">${p.currency} ${p.priceMin.toLocaleString()}–${p.priceMax.toLocaleString()}</div>
<div style="color:#9ca3af;font-size:12px;margin-top:3px">${l(lang, 'Entrega', 'Consegna', 'Delivery')}: ${p.leadTimeDays} ${l(lang, 'días', 'giorni', 'days')}</div></div>`).join('')}
</div>
<div class="sec" style="background:#fffbeb;border-color:#fde68a"><h3>📞 ${l(lang, 'Contactos Sa.To', 'Contatti Sa.To', 'Sa.To Contacts')}</h3>
<table><tr><th>Sara Miotto (CEO)</th><td>+54 9 3516 97-3809</td></tr>
<tr><th>Tomas Loppo (CEO)</th><td>+54 9 2216 81-5742</td></tr>
<tr><th>Luigi Casto (PM)</th><td>+39 391 347 0831</td></tr>
<tr><th>Email</th><td>gerencia@satogreenenergy.com</td></tr></table></div>
<footer><b>Sa.To DiagnosticAI v3.0</b> — Sa.To Green Energy S.A.<br>
${l(lang, 'Los precios son estimados y pueden variar. Documento generado automáticamente.', 'I prezzi sono stimati e possono variare. Documento generato automaticamente.', 'Prices are estimates and may vary. Automatically generated document.')}</footer>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `SaTo-Report-${result.componentName.replace(/\s+/g, '-')}-${Date.now()}.html`;
    a.click();
  };

  const condColor = (c: string) => {
    if (c?.match(/Bueno|Good|Buono/i)) return 'bg-green-100 text-green-700 border-green-200';
    if (c?.match(/Regular|Fair|Discreto/i)) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (c?.match(/Cr[ií]/i)) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  return (
    <div className="flex flex-col min-h-full px-4 py-5">

      {/* SCAN LIMIT BANNER */}
      {!isPremium && (
        <div className={`mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 border ${remaining <= 2 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <span className="text-xl">{remaining <= 2 ? '⚠️' : '💡'}</span>
          <div className="flex-1">
            <div className={`font-bold text-sm ${remaining <= 2 ? 'text-red-700' : 'text-amber-700'}`}>
              {remaining <= 0
                ? l(lang, 'Límite alcanzado', 'Limite raggiunto', 'Limit reached')
                : l(lang, `${remaining} análisis gratis restantes`, `${remaining} analisi gratis rimanenti`, `${remaining} free scans left`)}
            </div>
            <div className={`text-xs ${remaining <= 2 ? 'text-red-500' : 'text-amber-500'}`}>
              {remaining <= 0
                ? l(lang, 'Activa Premium para análisis ilimitados', 'Attiva Premium per analisi illimitate', 'Activate Premium for unlimited analyses')
                : l(lang, 'Premium = análisis ilimitados', 'Premium = analisi illimitate', 'Premium = unlimited analyses')}
            </div>
          </div>
          <button onClick={onNavigatePremium} className="bg-amber-500 text-white font-black text-xs py-1.5 px-3 rounded-xl active:scale-95 transition-transform flex-shrink-0">
            ⭐ Pro
          </button>
        </div>
      )}

      {/* UPLOAD */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div>
            <h1 className="font-black text-gray-900 text-xl">{l(lang, 'Nuevo Análisis', 'Nuova Analisi', 'New Scan')}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{l(lang, 'Fotografía o sube el componente a diagnosticar', 'Fotografa o carica il componente da diagnosticare', 'Photograph or upload the component to diagnose')}</p>
          </div>

          {!canScan ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <div className="font-black text-red-700 text-base mb-1">{l(lang, 'Límite gratuito alcanzado', 'Limite gratuito raggiunto', 'Free limit reached')}</div>
              <p className="text-red-500 text-sm mb-4">{l(lang, 'Usaste tus 10 análisis gratis. Activa Premium para continuar sin límite.', 'Hai usato le tue 10 analisi gratuite. Attiva Premium per continuare senza limiti.', 'You used your 10 free analyses. Activate Premium to continue without limits.')}</p>
              <button onClick={onNavigatePremium} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-3 px-8 rounded-xl active:scale-95 transition-transform">
                ⭐ {l(lang, 'Activar Premium', 'Attiva Premium', 'Activate Premium')}
              </button>
            </div>
          ) : (
            <>
              <div
                className="border-2 border-dashed border-emerald-300 bg-emerald-50/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer active:bg-emerald-100/60 transition-colors"
                onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
              >
                <div className="text-6xl mb-3">📸</div>
                <div className="font-bold text-gray-700 text-sm mb-1">{l(lang, 'Arrastra una imagen o toca para subir', 'Trascina o tocca per caricare', 'Drag image or tap to upload')}</div>
                <div className="text-gray-400 text-xs">JPG · PNG · WEBP</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => camRef.current?.click()} className="bg-emerald-600 text-white font-black py-4 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-md">
                  📷 {l(lang, 'Cámara', 'Fotocamera', 'Camera')}
                </button>
                <button onClick={() => fileRef.current?.click()} className="border-2 border-emerald-600 text-emerald-700 font-black py-4 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                  🖼️ {l(lang, 'Galería', 'Galleria', 'Gallery')}
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="font-bold text-blue-800 text-xs mb-2">💡 {l(lang, 'Mejores resultados', 'Migliori risultati', 'Better results')}</div>
                {[
                  l(lang, 'Foto clara con buena iluminación', 'Foto chiara con buona illuminazione', 'Clear photo with good lighting'),
                  l(lang, 'Acerca la cámara al área dañada', "Avvicina la fotocamera all'area danneggiata", 'Get close to the damaged area'),
                  l(lang, 'Incluye etiquetas o placa del equipo', 'Includi targhette o targa dati', 'Include equipment labels or data plate'),
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1">
                    <span className="text-blue-400 font-bold text-xs mt-0.5">✓</span>
                    <span className="text-blue-600 text-xs">{tip}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      )}

      {/* CONFIRM */}
      {step === 'confirm' && imageUrl && (
        <div className="space-y-4">
          <div>
            <h1 className="font-black text-gray-900 text-xl">{l(lang, '¿Lista la imagen?', 'Immagine pronta?', 'Image ready?')}</h1>
            <p className="text-gray-500 text-sm">{l(lang, "Verifica que sea clara antes de analizar", 'Verifica che sia chiara prima di analizzare', "Make sure it's clear before analysing")}</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-xl">
            <img src={imageUrl} alt="preview" className="w-full max-h-72 object-contain" />
            <button onClick={reset} className="absolute top-3 right-3 bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center shadow">✕</button>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
          <button onClick={analyze} disabled={analyzing}
            className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl text-base shadow-xl disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-3">
            {analyzing
              ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />{l(lang, 'Analizando...', 'Analisi in corso...', 'Analysing...')}</>
              : <>🤖 {l(lang, 'Analizar con IA', 'Analizza con IA', 'Analyse with AI')}</>
            }
          </button>
          <button onClick={reset} className="w-full border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl text-sm active:bg-gray-50">
            ← {l(lang, 'Cambiar imagen', 'Cambia immagine', 'Change image')}
          </button>
        </div>
      )}

      {/* RESULT */}
      {step === 'result' && result && (
        <div className="space-y-4">
          {/* Component card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
            {imageUrl && <img src={imageUrl} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="font-black text-gray-900 text-base leading-tight truncate">{result.componentName}</div>
              <div className="text-gray-500 text-xs mb-2">{result.system} · {result.plantType}</div>
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${condColor(result.condition)}`}>{result.condition}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">{result.confidence}% AI</span>
              </div>
            </div>
          </div>

          {/* Status pills */}
          {(result.operationalStatus || result.priorityLevel) && (
            <div className="grid grid-cols-2 gap-3">
              {result.operationalStatus && <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm"><div className="text-gray-400 text-xs font-semibold mb-0.5">{l(lang, 'Estado Op.', 'Stato Op.', 'Op. Status')}</div><div className="font-bold text-gray-900 text-xs">{result.operationalStatus}</div></div>}
              {result.priorityLevel && <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm"><div className="text-gray-400 text-xs font-semibold mb-0.5">{l(lang, 'Prioridad', 'Priorità', 'Priority')}</div><div className="font-bold text-gray-900 text-xs">{result.priorityLevel}</div></div>}
            </div>
          )}

          {/* Issues */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="font-bold text-gray-900 text-sm">⚠️ {l(lang, 'Problemas detectados', 'Problemi rilevati', 'Issues detected')}</div>
              <div className="text-xs text-gray-400">{result.issues.length}</div>
            </div>
            <div className="divide-y divide-gray-50">
              {result.issues.map((issue, i) => (
                <div key={i} className={`p-4 ${issue.severity === 'high' ? 'bg-red-50/30' : ''}`}>
                  <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold flex-shrink-0 ${SEV_COLOR[issue.severity]}`}>{issue.severity.toUpperCase()}</span>
                    <span className="font-bold text-gray-900 text-sm leading-tight">{issue.title}</span>
                  </div>
                  {issue.urgency && <div className="text-xs text-orange-600 font-bold mb-1.5">⏱ {issue.urgency}</div>}
                  <p className="text-gray-600 text-xs leading-relaxed mb-1.5">{issue.description}</p>
                  <p className="text-emerald-700 text-xs font-semibold leading-relaxed">💡 {issue.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance */}
          {result.maintenanceActions?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="font-bold text-gray-900 text-sm mb-3">🔧 {l(lang, 'Acciones de mantenimiento', 'Azioni di manutenzione', 'Maintenance actions')}</div>
              {result.maintenanceActions.map((a, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-black">{i + 1}</span>
                  <span className="text-gray-700 text-xs leading-relaxed">{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Sa.To products */}
          <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center gap-2">
              <span className="text-base">🌿</span>
              <div className="font-bold text-emerald-900 text-sm">{l(lang, 'Soluciones Sa.To Green Energy', 'Soluzioni Sa.To Green Energy', 'Sa.To Green Energy Solutions')}</div>
              {currency !== 'USD' && (
                <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{currency}</span>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {result.satoProducts.map((prod, i) => {
                const pMin = convertPrice(prod.priceMin, prod.currency, currency);
                const pMax = convertPrice(prod.priceMax, prod.currency, currency);
                return (
                  <div key={i} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-sm leading-tight">{prod.name}</div>
                        {prod.serviceType && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{prod.serviceType}</span>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-emerald-700 text-sm">{formatPrice(pMin, currency)}–{formatPrice(pMax, currency).replace(/^[A-Z€$]+\s?/, '')}</div>
                        <div className="text-gray-400 text-xs">{prod.leadTimeDays}d</div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed mb-2">{prod.description}</p>
                    <button onClick={() => openEmail(prod.name)} className="text-xs text-emerald-600 font-bold border border-emerald-200 rounded-lg px-3 py-1.5 active:bg-emerald-50">
                      📩 {l(lang, 'Solicitar cotización', 'Richiedi preventivo', 'Request quote')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action bar */}
          <div className="space-y-2">
            {isPremium && (
              <button onClick={downloadReport} className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                📄 {l(lang, 'Descargar Informe HTML', 'Scarica Report HTML', 'Download HTML Report')}
              </button>
            )}
            {!isPremium && (
              <button onClick={onNavigatePremium} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-4 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                ⭐ {l(lang, 'Premium: Descarga el informe + análisis ilimitados', 'Premium: Scarica report + analisi illimitate', 'Premium: Download report + unlimited analyses')}
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => openEmail()} className="bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5">
                ✉️ Email
              </button>
              <button onClick={() => window.open('https://wa.me/5493516973809')} className="bg-green-500 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5">
                💬 WhatsApp
              </button>
            </div>
            <button onClick={reset} className="w-full border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl text-sm active:bg-gray-50">
              🔄 {l(lang, 'Nuevo análisis', 'Nuova analisi', 'New scan')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
